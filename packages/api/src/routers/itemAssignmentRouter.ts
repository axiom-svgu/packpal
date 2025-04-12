import express from "express";
import { db } from "../database";
import {
  itemAssignments,
  type NewItemAssignment,
  type ItemAssignment,
} from "../database/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/auth";

const router = express.Router();

// Item assignment creation schema
const itemAssignmentSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  assignedTo: z.string().uuid("Invalid user ID"),
  status: z.enum(["to_pack", "packed", "delivered"]).default("to_pack"),
  notes: z.string().optional(),
});

// Get assignments by item
router.get(
  "/item/:itemId",
  authMiddleware,
  requireRole("viewer"),
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const result = await db.query.itemAssignments.findMany({
        where: eq(itemAssignments.itemId, itemId),
        with: {
          assignedTo: true,
          assignedBy: true,
        },
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  }
);

// Get assignments by user
router.get(
  "/user/:userId",
  authMiddleware,
  requireRole("viewer"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await db.query.itemAssignments.findMany({
        where: eq(itemAssignments.assignedTo, userId),
        with: {
          item: {
            with: {
              category: true,
            },
          },
          assignedBy: true,
        },
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  }
);

// Create a new assignment
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const validatedData = itemAssignmentSchema.parse(req.body);
    const newAssignment: NewItemAssignment = {
      ...validatedData,
      assignedBy: req.user?.id || "",
    };
    const assignment = await db
      .insert(itemAssignments)
      .values(newAssignment)
      .returning();
    res.status(201).json(assignment[0]);
  } catch (error) {
    console.error("Error creating assignment:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create assignment" });
    }
  }
});

// Update an assignment status
router.put(
  "/:id/status",
  authMiddleware,
  requireRole("member"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = z
        .object({
          status: z.enum(["to_pack", "packed", "delivered"]),
        })
        .parse(req.body);

      const assignment = await db
        .update(itemAssignments)
        .set({ status })
        .where(eq(itemAssignments.id, id))
        .returning();

      if (assignment.length === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment[0]);
    } catch (error) {
      console.error("Error updating assignment status:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update assignment status" });
      }
    }
  }
);

// Alias for PATCH requests
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("member"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = z
        .object({
          status: z.enum(["to_pack", "packed", "delivered"]),
        })
        .parse(req.body);

      const assignment = await db
        .update(itemAssignments)
        .set({ status })
        .where(eq(itemAssignments.id, id))
        .returning();

      if (assignment.length === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json(assignment[0]);
    } catch (error) {
      console.error("Error updating assignment status:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update assignment status" });
      }
    }
  }
);

// Delete an assignment
router.delete(
  "/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = await db
        .delete(itemAssignments)
        .where(eq(itemAssignments.id, id))
        .returning();
      if (assignment.length === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  }
);

export default router;
