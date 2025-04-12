import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

// If DATABASE_URL is not provided, build it from individual parameters
const fallbackConnectionString = `postgres://${
  process.env.DB_USER || "postgres"
}:${process.env.DB_PASS || "postgres"}@${process.env.DB_HOST || "localhost"}:${
  process.env.DB_PORT || "5432"
}/${process.env.DB_NAME || "postgres"}`;

// Final connection string to use
const dbConnectionString = fallbackConnectionString;

console.log("Connecting to database with:", {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
});

// Create Postgres client with special configuration for Neon
const client = postgres(dbConnectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: false,
  connection: {
    application_name: "packpal-api",
  },
});

// Merge schemas
const mergedSchema = { ...schema };

// Create Drizzle ORM instance with query builder
export const db = drizzle(client, {
  schema: mergedSchema,
  logger: process.env.NODE_ENV !== "production",
});

// Export direct access to tables and helpers
export { schema, eq };

// Initialize database connection
export async function initializeDb() {
  try {
    // Test connection by running a simple query
    console.log("Testing database connection...");
    const result = await client`SELECT current_timestamp as now`;
    console.log("Database test query result:", result[0]);
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }

    // Check for Neon-specific connection string issues
    if (!process.env.DATABASE_URL && process.env.DB_HOST?.includes("neon")) {
      console.error(
        "For Neon databases, it's recommended to use the full DATABASE_URL environment variable"
      );
      console.error("Check your .env file or environment configuration");
    }

    // Don't throw the error to allow the app to start even with DB issues
    return false;
  }
}
