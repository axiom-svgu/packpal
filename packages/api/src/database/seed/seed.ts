import { initializeDb } from "../index";
import { seedDatabase } from "./index";
import { db, schema } from "../index";

async function resetDatabase() {
  try {
    // Delete all data from all tables in reverse order of dependencies
    await db.delete(schema.listItemAssignments);
    await db.delete(schema.listItems);
    await db.delete(schema.lists);
    await db.delete(schema.itemAssignments);
    await db.delete(schema.items);
    await db.delete(schema.categories);
    await db.delete(schema.groupMembers);
    await db.delete(schema.groups);
    await db.delete(schema.users);
    console.log("Database reset completed successfully!");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

async function main() {
  try {
    // Initialize database connection
    const connected = await initializeDb();
    if (!connected) {
      console.error("Failed to connect to the database. Seeding aborted.");
      process.exit(1);
    }

    // Reset the database first
    // await resetDatabase();

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
