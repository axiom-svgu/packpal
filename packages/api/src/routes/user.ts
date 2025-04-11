import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { db } from "../database";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";

// Define a basic user model for validation
const UserSchema = t.Object({
  name: t.String(),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
});

// User routes
export const userRoutes = (app: Elysia) => {
  return app.group("/user", (app) => {
    // Public routes
    app.get("/", () => {
      return { message: "User API endpoint" };
    });

    // Protected routes with auth middleware
    app
      .use(authMiddleware)
      .get("/me", async ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { error: "Unauthorized" };
        }

        const userData = await db.query.users.findFirst({
          where: eq(users.id, user.id as string),
        });

        if (!userData) {
          set.status = 404;
          return { error: "User not found" };
        }

        return {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        };
      })
      .get("/:id", async ({ params: { id }, set }) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, id),
        });

        if (!user) {
          set.status = 404;
          return { error: "User not found" };
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      })
      .post(
        "/",
        ({ body }) => {
          // Here we would normally save to database
          return {
            id: "123",
            ...body,
            createdAt: new Date(),
          };
        },
        {
          body: UserSchema,
        }
      );

    return app;
  });
};
