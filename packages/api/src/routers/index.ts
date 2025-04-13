import { Express } from "express";
import authRouter from "./authRouter";
import groupRouter from "./groupRouter";
import listRouter from "./listRouter";
import categoryRouter from "./categoryRouter";
import itemRouter from "./itemRouter";
import itemAssignmentRouter from "./itemAssignmentRouter";
import memberRouter from "./memberRouter";
import { dashboardRouter } from "./dashboardRouter";
import aiRouter from "./aiRouter";
import notificationRouter from "./notificationRouter";

export async function registerRouters(app: Express) {
  const routers = [
    { path: "/auth", router: authRouter },
    { path: "/groups", router: groupRouter },
    { path: "/lists", router: listRouter },
    { path: "/categories", router: categoryRouter },
    { path: "/items", router: itemRouter },
    { path: "/item-assignments", router: itemAssignmentRouter },
    { path: "/members", router: memberRouter },
    { path: "/dashboard", router: dashboardRouter },
    { path: "/ai", router: aiRouter },
    { path: "/notifications", router: notificationRouter },
  ];

  for (const { path, router } of routers) {
    app.use(path, router);
  }

  return true;
}
