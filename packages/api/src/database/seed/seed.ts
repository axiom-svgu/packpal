import { initializeDb } from "../index";
import { seedDatabase } from "./index";

async function main() {
  try {
    // Initialize database connection
    const connected = await initializeDb();
    if (!connected) {
      console.error("Failed to connect to the database. Seeding aborted.");
      process.exit(1);
    }

    // Seed the database
    await seedDatabase();

    console.log("Database seeding completed successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Error during database seeding:", error);
    process.exit(1);
  }
}

main();
