import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

// Database connection string
const connectionString = `postgres://${process.env.DB_USER || "postgres"}:${
  process.env.DB_PASS || "postgres"
}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${
  process.env.DB_NAME || "postgres"
}?sslmode=require`;

// Create Postgres client
const client = postgres(connectionString, { max: 10 });

// Create Drizzle ORM instance with query builder
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV !== "production",
});

// Export direct access to tables and helpers
export { schema, eq };

// Initialize database connection
export async function initializeDb() {
  try {
    // Test connection by running a simple query
    await client`SELECT 1`;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
