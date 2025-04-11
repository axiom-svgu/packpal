import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection string
const connectionString = `postgres://${process.env.DB_USER || "postgres"}:${
  process.env.DB_PASS || "postgres"
}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${
  process.env.DB_NAME || "postgres"
}?sslmode=require`;

// Run migrations
async function main() {
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  console.log("Running migrations...");

  try {
    await migrate(db, { migrationsFolder: "./src/database/migrations" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

main();
