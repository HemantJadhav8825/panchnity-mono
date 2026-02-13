import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT_MATRIX_FILE = path.join(ROOT_DIR, 'infra/environment/.env.ports');

const main = () => {
  console.log('🔍 Auditing Monorepo Port Configuration...');

  if (!fs.existsSync(PORT_MATRIX_FILE)) {
    console.error(`❌ Port matrix file not found: ${PORT_MATRIX_FILE}`);
    process.exit(1);
  }

  const portMatrix = dotenv.parse(fs.readFileSync(PORT_MATRIX_FILE));
  let hasError = false;

  const workspaces = [
    { name: 'backend', path: 'apps/backend', portVar: 'BACKEND_GATEWAY_PORT' },
    { name: 'auth-service', path: 'services/auth-service', portVar: 'AUTH_SERVICE_PORT' },
    { name: 'frontend', path: 'apps/frontend', portVar: 'FRONTEND_PORT', isNext: true },
    { name: 'admin-panel', path: 'apps/admin-panel', portVar: 'ADMIN_PANEL_PORT' },
  ];

  workspaces.forEach((ws) => {
    const wsPath = path.join(ROOT_DIR, ws.path);
    const envFile = path.join(wsPath, '.env');
    const envLocalFile = path.join(wsPath, '.env.local');
    const pkgFile = path.join(wsPath, 'package.json');
    const expectedPort = portMatrix[ws.portVar];

    if (!expectedPort) {
      console.warn(`⚠️  No expected port defined for ${ws.name} in .env.ports`);
      return;
    }

    // 1. Check .env / .env.local
    const fileToCheck = fs.existsSync(envLocalFile) ? envLocalFile : envFile;
    if (fs.existsSync(fileToCheck)) {
      const config = dotenv.parse(fs.readFileSync(fileToCheck));
      if (config.PORT && config.PORT !== expectedPort) {
        console.error(`❌ ${ws.name}: PORT mismatch in ${path.basename(fileToCheck)}. Expected ${expectedPort}, found ${config.PORT}`);
        hasError = true;
      }
    }

    // 2. Check package.json for Next.js
    if (ws.isNext && fs.existsSync(pkgFile)) {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      const devScript = pkg.scripts?.dev || '';
      if (!devScript.includes(`-p ${expectedPort}`)) {
        console.error(`❌ ${ws.name}: package.json dev script missing "-p ${expectedPort}"`);
        hasError = true;
      }
    }
  });

  if (hasError) {
    console.error('\n💥 Port audit failed. Please fix the mismatches above.');
    process.exit(1);
  } else {
    console.log('\n✅ Port audit successful. All services aligned.');
  }
};

main();
