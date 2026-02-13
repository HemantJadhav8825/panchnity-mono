import fs from "fs";
import path from "path";
import crypto from "crypto";

const PROJECT_ROOT = process.cwd();
const POSTMAN_DIR = path.join(PROJECT_ROOT, "postman");
const REPORT_PATH = path.join(PROJECT_ROOT, "docs", "postman-sync-report.md");

interface RouteInfo {
  method: string;
  path: string;
  isProtected: boolean;
  bodySchema?: any;
  service: string;
}

interface PostmanCollection {
  info: {
    _postman_id: string;
    name: string;
    schema: string;
  };
  item: any[];
  auth?: any;
  event?: any[];
}

const COLLECTIONS_MAP: Record<string, string> = {
  "backend-gateway": "backend-gateway.postman_collection.json",
  "auth-service": "auth-service.postman_collection.json",
};

const BASE_URL_VARS: Record<string, string> = {
  "backend-gateway": "{{base_gateway_url}}",
  "auth-service": "{{auth_service_url}}",
};

function logReport(changes: {
  added: string[];
  updated: string[];
  removed: string[];
  skipped: string[];
}) {
  const timestamp = new Date().toISOString();
  let content = `\n## Sync Report - ${timestamp}\n`;

  if (changes.added.length)
    content += `### Added\n- ${changes.added.join("\n- ")}\n`;
  if (changes.updated.length)
    content += `### Updated\n- ${changes.updated.join("\n- ")}\n`;
  if (changes.removed.length)
    content += `### Removed\n- ${changes.removed.join("\n- ")}\n`;
  if (changes.skipped.length)
    content += `### Skipped / Ambiguous\n- ${changes.skipped.join("\n- ")}\n`;

  if (!fs.existsSync(path.dirname(REPORT_PATH))) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  }
  fs.appendFileSync(REPORT_PATH, content);
}

function parseZodSchema(filePath: string, schemaName: string): any {
  // Simple heuristic parser for Zod schemas
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const schemaMatch = content.match(
      new RegExp(
        `export const ${schemaName} = z\\.object\\({([\\s\\S]*?)}\\);`,
      ),
    );
    if (!schemaMatch) return null;

    const fieldsContent = schemaMatch[1];
    const fields: Record<string, any> = {};
    const fieldLines = fieldsContent.split("\n");

    for (const line of fieldLines) {
      const fieldMatch = line.trim().match(/^(\w+):/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        if (line.includes(".email(")) fields[fieldName] = "user@example.com";
        else if (line.includes(".min(")) fields[fieldName] = "password123";
        else fields[fieldName] = "string";
      }
    }
    return fields;
  } catch (e) {
    return null;
  }
}

function scanService(serviceDir: string, serviceName: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const srcDir = path.join(serviceDir, "src");
  if (!fs.existsSync(srcDir)) return routes;

  const appFile = path.join(srcDir, "app.ts");
  if (!fs.existsSync(appFile)) return routes;

  const appContent = fs.readFileSync(appFile, "utf-8");
  // Match app.use('/v1/auth', authRoutes) or app.use('/v1', apiRoutes)
  const mountMatches = Array.from(
    appContent.matchAll(/app\.use\(['"](.*?)['"]\s*,\s*(\w+)\)/g),
  );
  const routers: Record<string, string> = {};

  // Find imports to resolve router variable names to files
  const importMatches = Array.from(
    appContent.matchAll(/import (\w+) from ['"](.*?)['"]/g),
  );
  for (const match of importMatches) {
    routers[match[1]] = match[2];
  }

  for (const mount of mountMatches) {
    const basePath = mount[1];
    const routerVar = mount[2];
    let routerPath = routers[routerVar];

    if (routerPath) {
      if (!routerPath.endsWith(".ts")) {
        const fullPath = path.resolve(srcDir, routerPath + ".ts");
        if (fs.existsSync(fullPath)) {
          extractRoutesFromRouter(fullPath, basePath, serviceName, routes);
        } else {
          // Handle relative paths from app.ts
          const relativePath = path.resolve(
            path.dirname(appFile),
            routerPath + ".ts",
          );
          if (fs.existsSync(relativePath)) {
            extractRoutesFromRouter(
              relativePath,
              basePath,
              serviceName,
              routes,
            );
          }
        }
      }
    }
  }

  // Also handle direct app.get/post etc in app.ts
  const directMatches = Array.from(
    appContent.matchAll(/app\.(get|post|put|delete)\(['"](.*?)['"]/g),
  );
  for (const match of directMatches) {
    routes.push({
      method: match[1].toUpperCase(),
      path: cleanPath(match[2]),
      isProtected: false,
      service: serviceName,
    });
  }

  return routes;
}

function extractRoutesFromRouter(
  routerFile: string,
  basePath: string,
  serviceName: string,
  routes: RouteInfo[],
) {
  const content = fs.readFileSync(routerFile, "utf-8");
  const routerMatch = Array.from(
    content.matchAll(
      /router\.(get|post|put|delete)\(['"](.*?)['"]\s*,\s*(.*?)\)/g,
    ),
  );

  for (const match of routerMatch) {
    const method = match[1].toUpperCase();
    const subPath = match[2];
    const middleWareAndHandler = match[3];

    const isProtected = middleWareAndHandler.includes("requireAuth");

    // Guess schema if it's a POST/PUT
    let bodySchema = undefined;
    if (["POST", "PUT"].includes(method)) {
      // Look for schema usage in controllers or the same file
      const schemaUsage = content.match(/(\w+Schema)\.parse/);
      if (schemaUsage) {
        // Try to find where this schema is imported from
        const schemaImport = content.match(
          new RegExp(`import {.*${schemaUsage[1]}.*} from ['"](.*?)['"]`),
        );
        if (schemaImport) {
          const schemaFile = path.resolve(
            path.dirname(routerFile),
            schemaImport[1] + ".ts",
          );
          bodySchema = parseZodSchema(schemaFile, schemaUsage[1]);
        }
      }
    }

    routes.push({
      method,
      path: cleanPath(path.join(basePath, subPath)),
      isProtected,
      bodySchema,
      service: serviceName,
    });
  }
}

function cleanPath(p: string) {
  return p.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function updateCollection(
  serviceName: string,
  detectedRoutes: RouteInfo[],
  changes: any,
) {
  const fileName = COLLECTIONS_MAP[serviceName];
  if (!fileName) return;

  const collectionPath = path.join(POSTMAN_DIR, fileName);
  if (!fs.existsSync(collectionPath)) return;

  const collection: PostmanCollection = JSON.parse(
    fs.readFileSync(collectionPath, "utf-8"),
  );
  const baseUrlVar = BASE_URL_VARS[serviceName];

  const existingItemsMap = new Map();
  collection.item.forEach((item) => {
    const key = `${item.request.method}:${item.request.url.path.join("/")}`;
    existingItemsMap.set(key, item);
  });

  const newItems: any[] = [];
  const processedKeys = new Set();

  for (const route of detectedRoutes) {
    const pathSegments = route.path.split("/").filter(Boolean);
    const key = `${route.method}:${pathSegments.join("/")}`;
    processedKeys.add(key);

    const existingItem = existingItemsMap.get(key);

    const requestItem: any = {
      name: existingItem?.name || `${route.method} ${route.path}`,
      request: {
        method: route.method,
        header: [],
        url: {
          raw: `${baseUrlVar}${route.path}`,
          host: [baseUrlVar],
          path: pathSegments,
        },
      },
      response: existingItem?.response || [],
    };

    if (route.bodySchema) {
      requestItem.request.body = {
        mode: "raw",
        raw: JSON.stringify(route.bodySchema, null, 4),
        options: {
          raw: {
            language: "json",
          },
        },
      };
    }

    if (existingItem) {
      // Update if changed
      if (
        JSON.stringify(existingItem.request) !==
        JSON.stringify(requestItem.request)
      ) {
        changes.updated.push(`${serviceName}: ${route.method} ${route.path}`);
      }
      // Preserve events/scripts
      requestItem.event = existingItem.event;
      requestItem.name = existingItem.name;
    } else {
      changes.added.push(`${serviceName}: ${route.method} ${route.path}`);
    }

    newItems.push(requestItem);
  }

  // Check for removed
  for (const [key, item] of existingItemsMap) {
    if (!processedKeys.has(key)) {
      changes.removed.push(
        `${serviceName}: ${item.request.method} /${item.request.url.path.join("/")}`,
      );
    }
  }

  collection.item = newItems;
  fs.writeFileSync(
    collectionPath,
    JSON.stringify(collection, null, "\t") + "\n",
  );
}

async function main() {
  console.log("Starting Postman Collection Sync...");
  const changes = {
    added: [] as string[],
    updated: [] as string[],
    removed: [] as string[],
    skipped: [] as string[],
  };

  try {
    // 1. Backend Gateway
    const gatewayRoutes = scanService(
      path.join(PROJECT_ROOT, "apps", "backend"),
      "backend-gateway",
    );
    updateCollection("backend-gateway", gatewayRoutes, changes);

    // 2. Services
    const servicesDir = path.join(PROJECT_ROOT, "services");
    const services = fs
      .readdirSync(servicesDir)
      .filter((f) => fs.statSync(path.join(servicesDir, f)).isDirectory());

    for (const service of services) {
      const routes = scanService(path.join(servicesDir, service), service);
      updateCollection(service, routes, changes);
    }

    logReport(changes);

    if (
      changes.added.length > 0 ||
      changes.updated.length > 0 ||
      changes.removed.length > 0
    ) {
      console.log("POSTMAN_COLLECTIONS_UPDATED");
    } else {
      console.log("POSTMAN_COLLECTIONS_NO_CHANGE");
    }
  } catch (error: any) {
    console.error("Error during sync:", error);
    console.log("POSTMAN_COLLECTIONS_SYNC_FAILED");
    process.exit(1);
  }
}

main();
