import { Elysia } from "elysia";
import { userRoutes } from "./user";
import { authRoutes } from "./auth";

export const registerRoutes = (app: Elysia) => {
  const routes = [userRoutes, authRoutes];
  for (const route of routes) {
    app.use(route);
  }
};
