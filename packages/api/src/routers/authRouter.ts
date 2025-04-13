import express from "express";
import { db } from "../database";
import {
  users,
  type NewUser,
  groupMembers,
  itemAssignments,
  items,
} from "../database/schema";
import { eq, and, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../utils/constants";

const router = express.Router();

// Registration schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("viewer"),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      } as NewUser)
      .returning();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        success: false,
      });
    }

    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login successful",
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        success: false,
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Get user profile with stats
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        groups: {
          with: {
            group: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Get stats
    const userGroups = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, userId),
    });

    const groupIds = userGroups.map((group) => group.groupId);

    // Count assigned items
    const assignedItemsCount = await db
      .select({ count: count() })
      .from(itemAssignments)
      .where(eq(itemAssignments.assignedTo, userId));

    // Count items by status
    const toPackCount = await db
      .select({ count: count() })
      .from(itemAssignments)
      .where(
        and(
          eq(itemAssignments.assignedTo, userId),
          eq(itemAssignments.status, "to_pack")
        )
      );

    const packedCount = await db
      .select({ count: count() })
      .from(itemAssignments)
      .where(
        and(
          eq(itemAssignments.assignedTo, userId),
          eq(itemAssignments.status, "packed")
        )
      );

    const deliveredCount = await db
      .select({ count: count() })
      .from(itemAssignments)
      .where(
        and(
          eq(itemAssignments.assignedTo, userId),
          eq(itemAssignments.status, "delivered")
        )
      );

    // Recent assignments
    const recentAssignments = await db.query.itemAssignments.findMany({
      where: eq(itemAssignments.assignedTo, userId),
      with: {
        item: true,
        assignedBy: true,
      },
      orderBy: (itemAssignments, { desc }) => [desc(itemAssignments.updatedAt)],
      limit: 5,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Profile retrieved successfully",
      success: true,
      data: {
        user: userWithoutPassword,
        stats: {
          groupsCount: userGroups.length,
          assignedItemsCount: assignedItemsCount[0]?.count || 0,
          toPackCount: toPackCount[0]?.count || 0,
          packedCount: packedCount[0]?.count || 0,
          deliveredCount: deliveredCount[0]?.count || 0,
        },
        recentAssignments,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Update profile schema
    const updateProfileSchema = z.object({
      name: z.string().min(1, "Name is required").optional(),
      email: z.string().email("Invalid email format").optional(),
      currentPassword: z
        .string()
        .min(1, "Current password is required")
        .optional(),
      newPassword: z
        .string()
        .min(6, "New password must be at least 6 characters long")
        .optional(),
    });

    const validatedData = updateProfileSchema.parse(req.body);
    const { name, email, currentPassword, newPassword } = validatedData;

    // Get current user data
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // If changing email, check if it's already taken
    if (email && email !== currentUser.email) {
      const existingUserWithEmail = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUserWithEmail) {
        return res.status(400).json({
          message: "Email already in use",
          success: false,
        });
      }
    }

    // Prepare update data
    const updateData: Partial<NewUser> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Handle password change
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Current password is incorrect",
          success: false,
        });
      }

      // Hash and set new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    if (Object.keys(updateData).length > 0) {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      return res.status(200).json({
        message: "Profile updated successfully",
        success: true,
        data: {
          user: userWithoutPassword,
        },
      });
    } else {
      // No data to update
      return res.status(400).json({
        message: "No valid data provided for update",
        success: false,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        success: false,
      });
    }

    console.error("Profile update error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Example of a protected route with role-based access
router.get("/admin", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    return res.status(200).json({
      message: "Admin access granted",
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Admin route error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

export default router;
