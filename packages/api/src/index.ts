import { initializeDb } from "./database";
import Elysia from "elysia";
import { registerRoutes } from "./routes";

const createApp = () => {
  const elysia = new Elysia().get("/", () => ({
    message: "Scaffold API is running",
  }));

  registerRoutes(elysia);

  return elysia;
};

// Initialize database
await initializeDb();

// Create and export the app instance
const app = createApp();

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port);
  console.log(
    `🚀 API is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

// Export for serverless
export default app;
