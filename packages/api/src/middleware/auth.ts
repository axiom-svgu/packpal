import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

// JWT middleware for authentication
export const jwtMiddleware = new Elysia().use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "your-secret-key",
  })
);

// Auth middleware to verify JWT token
export const authMiddleware = new Elysia()
  .use(jwtMiddleware)
  .derive(async ({ jwt, request, set }) => {
    const authorization = request.headers.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return { user: null };
    }

    const token = authorization.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { user: null };
    }

    return { user: payload };
  });

// Auth guard that can be used in routes
export const authGuard = new Elysia()
  .use(authMiddleware)
  .derive(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    return {};
  });
