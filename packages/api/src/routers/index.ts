import type { Express } from "express";
import authRouter from "./auth";

export async function registerRouters(app: Express) {
  const routers = [{ path: "/auth", router: authRouter }];

  for (const { path, router } of routers) {
    app.use(path, router);
  }
}
