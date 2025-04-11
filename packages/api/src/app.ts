import express, { Request, Response } from "express";
import cors from "cors";

import { registerRouters } from "./routers";
import { bindLogger } from "./utils/logging";
import { validateEnv } from "./utils/validation";
import bodyParser from "body-parser";

import constants from "./utils/constants";
import { loggingMiddleware } from "./middleware/log";
import { initializeDb } from "./database";
const app = express();
const port = constants.PORT;

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
      origin: ["http://localhost:5173", "https://packpal-app.axiomclub.tech"],
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
