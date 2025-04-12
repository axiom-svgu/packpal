import express from "express";
import { db } from "../database";
import {
  categories,
  type NewCategory,
  type Category,
} from "../database/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { GroupRole } from "../types";

const router = express.Router();

// Category creation schema
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  groupId: z.string().uuid("Invalid group ID"),
});

// Get all categories for a group
router.get(
  "/group/:groupId",
  authMiddleware,
  requireRole("viewer"),
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const result = await db.query.categories.findMany({
        where: eq(categories.groupId, groupId),
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  }
);

// Create a new category
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const validatedData = categorySchema.parse(req.body);
    const newCategory: NewCategory = {
      ...validatedData,
      createdBy: req.user?.id || "",
    };
    const category = await db
      .insert(categories)
      .values(newCategory)
      .returning();
    res.status(201).json(category[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create category" });
    }
  }
});

// Update a category
router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = categorySchema.partial().parse(req.body);
    const category = await db
      .update(categories)
      .set(validatedData)
      .where(eq(categories.id, id))
      .returning();
    if (category.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update category" });
    }
  }
});

// Delete a category
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const category = await db
        .delete(categories)
        .where(eq(categories.id, id))
        .returning();
      if (category.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
);

export default router;
