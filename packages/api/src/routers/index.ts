import { Express } from "express";
import authRouter from "./authRouter";
import groupRouter from "./groupRouter";
import listRouter from "./listRouter";

export async function registerRouters(app: Express) {
  const routers = [
    { path: "/auth", router: authRouter },
    { path: "/groups", router: groupRouter },
    { path: "/lists", router: listRouter },
  ];

  for (const { path, router } of routers) {
    app.use(path, router);
  }
}
