import express from "express";
import { db } from "../database";
import { items, type NewItem, type Item } from "../database/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/auth";

const router = express.Router();

// Item creation schema
const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  categoryId: z.string().uuid("Invalid category ID"),
  groupId: z.string().uuid("Invalid group ID"),
});

// Get all items for a group
router.get(
  "/group/:groupId",
  authMiddleware,
  requireRole("viewer"),
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const result = await db.query.items.findMany({
        where: eq(items.groupId, groupId),
        with: {
          category: true,
          assignments: {
            with: {
              assignedTo: true,
            },
          },
        },
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  }
);

// Get items by category
router.get(
  "/category/:categoryId",
  authMiddleware,
  requireRole("viewer"),
  async (req, res) => {
    try {
      const { categoryId } = req.params;
      const result = await db.query.items.findMany({
        where: eq(items.categoryId, categoryId),
        with: {
          assignments: {
            with: {
              assignedTo: true,
            },
          },
        },
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  }
);

// Create a new item
router.post("/", authMiddleware, requireRole("member"), async (req, res) => {
  try {
    const validatedData = itemSchema.parse(req.body);
    const newItem: NewItem = {
      ...validatedData,
      createdBy: req.user?.id || "",
    };
    const item = await db.insert(items).values(newItem).returning();
    res.status(201).json(item[0]);
  } catch (error) {
    console.error("Error creating item:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create item" });
    }
  }
});

// Update an item
router.put("/:id", authMiddleware, requireRole("member"), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = itemSchema.partial().parse(req.body);
    const item = await db
      .update(items)
      .set(validatedData)
      .where(eq(items.id, id))
      .returning();
    if (item.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item[0]);
  } catch (error) {
    console.error("Error updating item:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to update item" });
    }
  }
});

// Delete an item
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const item = await db.delete(items).where(eq(items.id, id)).returning();
      if (item.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  }
);

export default router;
