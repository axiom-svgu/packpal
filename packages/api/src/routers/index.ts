import { Express } from "express";
import authRouter from "./authRouter";
import groupRouter from "./groupRouter";

export async function registerRouters(app: Express) {
  const routers = [
    { path: "/auth", router: authRouter },
    { path: "/groups", router: groupRouter },
  ];

  for (const { path, router } of routers) {
    app.use(path, router);
  }
}
