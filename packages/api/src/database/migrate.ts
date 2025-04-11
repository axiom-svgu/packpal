import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection string
const connectionString = `postgres://${process.env.DB_USER || "postgres"}:${
  process.env.DB_PASS || "postgres"
}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${
  process.env.DB_NAME || "postgres"
}?sslmode=require`;

// Create Postgres client
const client = postgres(connectionString, { max: 1 });

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
    process.exit(1);
  }
}

main();
