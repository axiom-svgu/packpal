import { Elysia, t } from "elysia";
import { jwtMiddleware } from "../middleware/auth";
import { db } from "../database";
import { users } from "../database/schema";
import { compare, hash } from "@node-rs/bcrypt";
import { eq } from "drizzle-orm";

// Validation schemas
const LoginSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
});

const RegisterSchema = t.Object({
  name: t.String({ minLength: 2 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
});

// Auth routes
export const authRoutes = (app: Elysia) =>
  app.group("/auth", (app) => {
    return app
      .use(jwtMiddleware)
      .options("/login", ({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
        set.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
        set.headers["Access-Control-Allow-Headers"] =
          "Content-Type, Authorization";
        set.headers["Access-Control-Allow-Credentials"] = "true";
        return "";
      })
      .post(
        "/login",
        async ({ body, jwt, set }) => {
          set.headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
          set.headers["Access-Control-Allow-Credentials"] = "true";

          const { email, password } = body;

          // Find user by email
          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            set.status = 401;
            return { error: "Invalid credentials" };
          }

          // Compare password
          const isPasswordValid = await compare(password, user.password);

          if (!isPasswordValid) {
            set.status = 401;
            return { error: "Invalid credentials" };
          }

          // Generate JWT token
          const token = await jwt.sign({
            id: user.id,
            email: user.email,
          });

          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            token,
          };
        },
        {
          body: LoginSchema,
        }
      )
      .options("/register", ({ set }) => {
        set.headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
        set.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
        set.headers["Access-Control-Allow-Headers"] =
          "Content-Type, Authorization";
        set.headers["Access-Control-Allow-Credentials"] = "true";
        return "";
      })
      .post(
        "/register",
        async ({ body, jwt, set }) => {
          set.headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
          set.headers["Access-Control-Allow-Credentials"] = "true";

          const { name, email, password } = body;

          // Check if user with email already exists
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (existingUser) {
            set.status = 400;
            return { error: "User with this email already exists" };
          }

          // Hash password
          const hashedPassword = await hash(password, 10);

          // Create new user
          const [user] = await db
            .insert(users)
            .values({
              name,
              email,
              password: hashedPassword,
            })
            .returning();

          // Generate JWT token
          const token = await jwt.sign({
            id: user.id,
            email: user.email,
          });

          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            token,
          };
        },
        {
          body: RegisterSchema,
        }
      );
  });
