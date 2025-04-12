import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection string for Neon PostgreSQL
const connectionString = `postgres://${process.env.DB_USER || "postgres"}:${
  process.env.DB_PASS || "postgres"
}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${
  process.env.DB_NAME || "postgres"
}`;

console.log("Migration connecting to database:", {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
});

// Create Postgres client with proper configuration for Neon
const client = postgres(connectionString, {
  max: 1,
  connect_timeout: 10,
  idle_timeout: 20,
  ssl: false,
  connection: {
    application_name: "packpal-api",
  },
  prepare: false,
});

// Create Drizzle ORM instance
const db = drizzle(client, { schema });

// Run migrations
async function main() {
  console.log("Running migrations...");

  try {
    await migrate(db, { migrationsFolder: "./src/database/migrations" });
    console.log("Migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error running migrations:", error);
    // Show more detailed error information
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

main();
