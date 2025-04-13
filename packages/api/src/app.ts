import express, { Request, Response } from "express";
import cors from "cors";
import { EventEmitter } from "events";

import { registerRouters } from "./routers";
import { bindLogger } from "./utils/logging";
import { validateEnv } from "./utils/validation";
import bodyParser from "body-parser";

import constants from "./utils/constants";
import { loggingMiddleware } from "./middleware/log";
import { initializeDb } from "./database";
const app = express();
const port = constants.PORT;

export const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(100); // Increase max listeners to handle multiple clients

async function initializeApp() {
  app.use(
    bodyParser.json({
      verify: (req, res, buf, encoding) => {
        try {
          JSON.parse(buf.toString());
        } catch (e) {
          res.statusCode = 400;
          res.setHeader("content-type", "application/json");
          res.write(
            JSON.stringify({
              message: "Invalid JSON",
              success: false,
            })
          );
          res.end();
        }
      },
    })
  );

  bindLogger();
  app.use(loggingMiddleware);
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://packpal-app.axiomclub.tech",
        "http://localhost:5174",
        "http://localhost:5175",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  if (!validateEnv()) {
    console.log(`Please fix the environment variables and try again`);
    process.exit(1);
  }
  console.info("PackPal API is starting...");

  try {
    const dbConnected = await initializeDb();
    if (!dbConnected) {
      console.warn(
        "Starting server with limited functionality due to database connection issues"
      );
    }
  } catch (error) {
    console.error(
      "Failed to initialize database, starting with limited functionality:",
      error
    );
  }

  await registerRouters(app);

  // Add SSE endpoint

  app.get("/sse", (req: Request, res: Response) => {
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };

    res.writeHead(200, headers);

    // Send initial connection message

    const data = `data: ${JSON.stringify({
      type: "connection",

      message: "Connected to SSE",
    })}\n\n`;

    res.write(data);

    // Set up event listeners for different update types

    const eventTypes = [
      "item-update",
      "list-update",
      "category-update",
      "group-update",
      "assignment-update",
      "notification-created",
      "notification-update",
    ];

    const handlers: Record<string, (data: any) => void> = {};

    eventTypes.forEach((type) => {
      handlers[type] = (data) => {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
      };

      eventEmitter.on(type, handlers[type]);
    });

    // Handle client disconnect

    req.on("close", () => {
      eventTypes.forEach((type) => {
        eventEmitter.off(type, handlers[type]);
      });
    });
  });

  app.get("/", (_: Request, res: Response) => {
    res.json({
      message: "PackPal API is running",
      success: true,
    });
  });

  return app;
}

// Initialize the app immediately if this is the main module
if (require.main === module) {
  initializeApp()
    .then((app) => {
      app.listen(port, () =>
        console.info(`Server running at http://localhost:${port}`)
      );
    })
    .catch((error) => {
      console.error("Failed to initialize application:", error);
    });
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown", error);
});

// Export a function that returns the initialized app
export default async function () {
  return await initializeApp();
}
