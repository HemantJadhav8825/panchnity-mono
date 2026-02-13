/**
 * Formats and logs a database connection message securely.
 *
 * @param serviceName - The name of the service (e.g., 'auth-service')
 * @param connectionString - The full DB connection string (secrets will be stripped)
 */
export const logDbConnection = (
  serviceName: string,
  connectionString: string,
): void => {
  try {
    // Regex to capture host and db name from common MongoDB connection strings
    // mongodb://[user:pass@]host1[:port1][,...hostN[:portN]]][/[database][?options]]
    // mongodb+srv://[user:pass@]host[/[database][?options]]

    let host = "unknown-host";
    let dbName = "unknown-db";

    // Simplified parsing logic for standard connection strings
    if (connectionString.startsWith("mongodb")) {
      // Match host(s) and database
      // Matches everything after @ (if present) or :// up to the / or ?
      const hostMatch = connectionString.match(/(?:@|:\/\/)([^/?]+)/);
      if (hostMatch) host = hostMatch[1];

      // Matches the path segment (database)
      const dbMatch = connectionString.match(/\/([^/?]+)(?:\?|$)/);
      if (dbMatch) dbName = dbMatch[1];
    } else {
      // Generic fallback if it's not MongoDB (e.g. SQL)
      // This is a basic sanity check
      const url = new URL(connectionString);
      host = url.host;
      dbName = url.pathname.replace("/", "");
    }

    console.log(`${serviceName} connected to ${host} with ${dbName}`);
  } catch (err) {
    // If parsing fails, we log a generic message without the connection string to be safe
    console.log(`${serviceName} connected to database`);
  }
};

export interface LogMetadata {
  userId?: string;
  socketId?: string;
  conversationId?: string;
  error?: string;
  reason?: string;
  [key: string]: any;
}

/**
 * Logs a structured JSON message for better observability.
 */
export const structuredLog = (
  level: "info" | "warn" | "error",
  event: string,
  message: string,
  metadata: LogMetadata = {},
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
    ...metadata,
  };

  if (level === "error") {
    console.error(JSON.stringify(logEntry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
};
