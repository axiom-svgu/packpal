import { Express } from "express";
import authRouter from "./authRouter";
import groupRouter from "./groupRouter";
import categoryRouter from "./categoryRouter";
import itemRouter from "./itemRouter";
import itemAssignmentRouter from "./itemAssignmentRouter";
import memberRouter from "./memberRouter";

export async function registerRouters(app: Express) {
  const routers = [
    { path: "/auth", router: authRouter },
    { path: "/groups", router: groupRouter },
    { path: "/categories", router: categoryRouter },
    { path: "/items", router: itemRouter },
    { path: "/item-assignments", router: itemAssignmentRouter },
    { path: "/members", router: memberRouter },
  ];

  for (const { path, router } of routers) {
    app.use(path, router);
  }
}
