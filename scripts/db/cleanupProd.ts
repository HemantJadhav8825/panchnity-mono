import { MongoClient } from 'mongodb';
import { Client as PgClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ─────────────────────────────────────────────────────────────
// 🔥 HARDCODED DATABASE CONFIGURATION
// ─────────────────────────────────────────────────────────────

const DB_CONFIGS: DBConfig[] = [
  {
    name: 'auth-service (mongodb)',
    type: 'mongodb',
    url: "mongodb://admin:adminUser_hemant%40123@72.62.196.46:27017/hold_yourself_auth?authSource=admin"
  },
  {
    name: 'chat-service (mongodb)',
    type: 'mongodb',
    url: "mongodb://admin:adminUser_hemant%40123@72.62.196.46:27017/hold_yourself_chat?authSource=admin"
  }
];

// ─────────────────────────────────────────────────────────────
// ENV & SAFETY GUARDS
// ─────────────────────────────────────────────────────────────

const NODE_ENV = process.env.NODE_ENV || 'development';
const DB_ENV = process.env.DB_ENV || 'dev';
const CONFIRM_DB_RESET = process.env.CONFIRM_DB_RESET === 'true';

const IS_PRODUCTION = NODE_ENV === 'production' || DB_ENV === 'prod';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface DBConfig {
  name: string;
  url: string;
  type: 'mongodb' | 'postgres';
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Sanitizes MongoDB connection URLs by removing invalid / empty params
 */
function sanitizeMongoURL(url: string): string {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const cleanParams = new URLSearchParams();

    params.forEach((value, key) => {
      if (value && value.trim() !== '') {
        cleanParams.set(key, value);
      }
    });

    urlObj.search = cleanParams.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}



// ─────────────────────────────────────────────────────────────
// SAFETY VALIDATION
// ─────────────────────────────────────────────────────────────

async function validateSafety() {
  if (IS_PRODUCTION) {
    console.error('❌ ERROR: This script CANNOT run in production.');
    console.error(`NODE_ENV=${NODE_ENV}, DB_ENV=${DB_ENV}`);
    process.exit(1);
  }

  if (!CONFIRM_DB_RESET) {
    console.error('❌ ERROR: CONFIRM_DB_RESET not set.');
    console.error('Run with: CONFIRM_DB_RESET=true pnpm db:reset');
    process.exit(1);
  }

  for (const db of DB_CONFIGS) {
    if (db.url.includes('prod') || db.url.includes('atlas')) {
      throw new Error(`🚨 Production-like DB detected: ${db.name}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// DATABASE CLEANERS
// ─────────────────────────────────────────────────────────────

async function cleanMongoDB(config: DBConfig) {
  const client = new MongoClient(config.url);
  try {
    await client.connect();
    const db = client.db();
    const dbName = db.databaseName;
    const host = client.options.hosts[0];

    console.log(`⚠️  Resetting MongoDB: ${dbName} on ${host}`);

    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      if (col.name.startsWith('system.')) continue;
      if (col.name.includes('migration') || col.name.includes('changelog')) {
        console.log(`ℹ️  Skipping migration collection: ${col.name}`);
        continue;
      }

      await db.collection(col.name).deleteMany({});
      console.log(`🧹 Cleared collection: ${col.name}`);
    }
  } finally {
    await client.close();
  }
}

async function cleanPostgres(config: DBConfig) {
  const client = new PgClient({ connectionString: config.url });
  try {
    await client.connect();
    // @ts-ignore
    const dbName = client.database || 'unknown';
    // @ts-ignore
    const host = client.host || 'unknown';

    console.log(`⚠️  Resetting Postgres: ${dbName} on ${host}`);

    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT ILIKE '%migration%'
      AND table_name NOT ILIKE '%changelog%'
    `);

    const tables = res.rows.map(r => r.table_name);

    if (!tables.length) {
      console.log('ℹ️  No tables found.');
      return;
    }

    await client.query(
      `TRUNCATE TABLE ${tables.map(t => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE;`
    );

    tables.forEach(t => console.log(`🧹 Cleared table: ${t}`));
  } finally {
    await client.end();
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  await validateSafety();

  console.log('\n🚀 Starting Database Cleanup...');
  console.log(`Environment: ${NODE_ENV}\n`);

  for (const config of DB_CONFIGS) {
    console.log(`\n--- Cleaning [${config.name}] ---`);
    try {
      if (config.type === 'mongodb') {
        await cleanMongoDB(config);
      } else {
        await cleanPostgres(config);
      }
    } catch (err: any) {
      console.error(`❌ Failed on ${config.name}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\n✅ Database reset complete — fresh state achieved\n');
}

main().catch(err => {
  console.error('❌ FATAL ERROR');
  console.error(err);
  process.exit(1);
});
