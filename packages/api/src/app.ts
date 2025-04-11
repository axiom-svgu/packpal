import express, { type Request, type Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { registerRouters } from "./routers";
import { bindLogger } from "./utils/logging";
import { validateEnv } from "./utils/validation";

import constants from "./utils/constants";
import { loggingMiddleware } from "./middleware/log";
import { initializeDb } from "./database";
const app = express();
const port = constants.PORT;

async function initializeApp() {
  bindLogger();
  app.use(loggingMiddleware);
  app.use(cors());
  if (!validateEnv()) {
    console.log(`Please fix the environment variables and try again`);
    process.exit(1);
  }
  console.info("PackPal API is starting...");
  await initializeDb();
  await registerRouters(app);

  app.get("/", (_: Request, res: Response) => {
    res.json({
      message: "PackPal API is running",
      success: true,
    });
  });
  app.listen(port, () =>
    console.info(`Server running at http://localhost:${port}`)
  );
}

initializeApp();

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown", error);
});
