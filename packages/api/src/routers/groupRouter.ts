import express from "express";
import { db } from "../database";
import {
  groups,
  groupMembers,
  NewGroup,
  NewGroupMember,
} from "../database/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { groupCreationSchema, groupMemberSchema } from "../database/schema";
import { z } from "zod";

const router = express.Router();

// Create a new group
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const validatedData = groupCreationSchema.parse(req.body);
    const { name, description } = validatedData;

    // Create the group
    const [newGroup] = await db
      .insert(groups)
      .values({
        name,
        description,
        createdBy: req.user.id,
      } as NewGroup)
      .returning();

    // Add the creator as the group owner
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: req.user.id,
      role: "owner",
    } as NewGroupMember);

    return res.status(201).json({
      message: "Group created successfully",
      success: true,
      data: newGroup,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        success: false,
      });
    }

    console.error("Group creation error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Add a member to a group
router.post("/:groupId/members", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const { groupId } = req.params;
    const validatedData = groupMemberSchema.parse(req.body);
    const { userId, role } = validatedData;

    // Check if the requester has permission to add members
    const requesterMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, req.user.id)
      ),
    });

    if (
      !requesterMembership ||
      !["owner", "admin"].includes(requesterMembership.role)
    ) {
      return res.status(403).json({
        message: "You don't have permission to add members to this group",
        success: false,
      });
    }

    // Check if the user is already a member
    const existingMember = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (existingMember) {
      return res.status(400).json({
        message: "User is already a member of this group",
        success: false,
      });
    }

    // Add the member
    const [newMember] = await db
      .insert(groupMembers)
      .values({
        groupId,
        userId,
        role,
      } as NewGroupMember)
      .returning();

    return res.status(201).json({
      message: "Member added successfully",
      success: true,
      data: newMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        success: false,
      });
    }

    console.error("Add member error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Update member role
router.patch("/:groupId/members/:userId", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const { groupId, userId } = req.params;
    const { role } = groupMemberSchema.parse(req.body);

    // Check if the requester has permission to update roles
    const requesterMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, req.user.id)
      ),
    });

    if (
      !requesterMembership ||
      !["owner", "admin"].includes(requesterMembership.role)
    ) {
      return res.status(403).json({
        message: "You don't have permission to update roles in this group",
        success: false,
      });
    }

    // Update the member's role
    const [updatedMember] = await db
      .update(groupMembers)
      .set({ role } as Partial<NewGroupMember>)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      )
      .returning();

    return res.status(200).json({
      message: "Member role updated successfully",
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: error.errors[0].message,
        success: false,
      });
    }

    console.error("Update member role error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Get group members
router.get("/:groupId/members", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const { groupId } = req.params;

    // Check if the user is a member of the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, req.user.id)
      ),
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this group",
        success: false,
      });
    }

    // Get all members
    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: {
        user: true,
      },
    });

    return res.status(200).json({
      message: "Members retrieved successfully",
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Remove a member from a group
router.delete("/:groupId/members/:userId", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    const { groupId, userId } = req.params;

    // Check if the requester has permission to remove members
    const requesterMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, req.user.id)
      ),
    });

    if (
      !requesterMembership ||
      !["owner", "admin"].includes(requesterMembership.role)
    ) {
      return res.status(403).json({
        message: "You don't have permission to remove members from this group",
        success: false,
      });
    }

    // Remove the member
    await db
      .delete(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      );

    return res.status(200).json({
      message: "Member removed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

export default router;
