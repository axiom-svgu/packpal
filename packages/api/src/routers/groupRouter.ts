import express, { Request, Response } from "express";
import { db } from "../database";
import {
  groups,
  groupMembers,
  NewGroup,
  NewGroupMember,
  users,
  User,
} from "../database/schema";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import { requireGroupRole } from "../middleware/auth";
import { groupCreationSchema, groupMemberSchema } from "../database/schema";
import { z } from "zod";

const router = express.Router();

// Schema for creating a group
const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
});

// Schema for adding a member to a group
const addMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "member", "viewer", "owner"]).default("member"),
});

// Augment the GroupMember type to include the user property
type GroupMemberWithUser = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
  joinedAt: Date;
};

// Create a new group
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const validatedData = createGroupSchema.parse(req.body);
    const { name, description } = validatedData;

    // Start a transaction
    await db.transaction(async (tx) => {
      // Create the group
      const [newGroup] = await tx
        .insert(groups)
        .values({
          name,
          description,
          createdBy: userId,
        } as NewGroup)
        .returning();

      // Add the creator as an owner of the group
      await tx.insert(groupMembers).values({
        groupId: newGroup.id,
        userId,
        role: "owner",
      } as NewGroupMember);

      return res.status(201).json({
        message: "Group created successfully",
        success: true,
        data: {
          group: newGroup,
        },
      });
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

// Get all groups that the authenticated user is a member of
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;

    // Get all group memberships for the user
    const memberships = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, userId),
      with: {
        group: true,
      },
    });

    const userGroups = memberships.map((membership) => ({
      ...(membership.group as object),
      role: membership.role,
    }));

    return res.status(200).json({
      message: "Groups retrieved successfully",
      success: true,
      data: {
        groups: userGroups,
      },
    });
  } catch (error) {
    console.error("Get groups error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Get group details by ID
router.get("/:groupId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { id: userId } = req.user!;

    // Check if user is a member of the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({
        message: "You don't have access to this group",
        success: false,
      });
    }

    // Get group details
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false,
      });
    }

    // Get all members of the group
    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format member data
    const formattedMembers = members.map((member) => ({
      id: member.user?.id,
      name: member.user?.name,
      email: member.user?.email,
      role: member.role,
      joinedAt: member.joinedAt,
    }));

    return res.status(200).json({
      message: "Group retrieved successfully",
      success: true,
      data: {
        group: {
          ...group,
          members: formattedMembers,
          userRole: membership.role,
        },
      },
    });
  } catch (error) {
    console.error("Get group error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Add a member to a group
router.post(
  "/:groupId/members",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params;
      const { id: userId } = req.user!;
      const validatedData = addMemberSchema.parse(req.body);
      const { email, role } = validatedData;

      // Check if the current user has permission to add members (must be an admin or owner)
      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (!membership || !["owner", "admin"].includes(membership.role)) {
        return res.status(403).json({
          message: "You don't have permission to add members to this group",
          success: false,
        });
      }

      // Find the user by email
      const userToAdd = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!userToAdd) {
        return res.status(404).json({
          message: "User with this email not found",
          success: false,
        });
      }

      // Check if user is already a member
      const existingMembership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userToAdd.id)
        ),
      });

      if (existingMembership) {
        return res.status(400).json({
          message: "User is already a member of this group",
          success: false,
        });
      }

      // Check if the current user is trying to add an owner (only owners can add owners)
      if (role === "owner" && membership.role !== "owner") {
        return res.status(403).json({
          message: "Only group owners can add new owners",
          success: false,
        });
      }

      // Add the member to the group
      await db.insert(groupMembers).values({
        groupId,
        userId: userToAdd.id,
        role,
      });

      return res.status(201).json({
        message: "Member added successfully",
        success: true,
        data: {
          member: {
            id: userToAdd.id,
            name: userToAdd.name,
            email: userToAdd.email,
            role,
          },
        },
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
  }
);

// Search for users by email (to add to group)
router.get(
  "/search/users",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        return res.status(400).json({
          message: "Email query parameter is required",
          success: false,
        });
      }

      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
        columns: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        });
      }

      return res.status(200).json({
        message: "User found",
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Search users error:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  }
);

// Update member role in a group
router.put(
  "/:groupId/members/:memberId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { groupId, memberId } = req.params;
      const { id: userId } = req.user!;
      const { role } = req.body;

      if (!role || !["admin", "member", "viewer", "owner"].includes(role)) {
        return res.status(400).json({
          message: "Valid role is required",
          success: false,
        });
      }

      // Check if the current user has permission (must be an admin or owner)
      const userMembership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (
        !userMembership ||
        !["owner", "admin"].includes(userMembership.role)
      ) {
        return res.status(403).json({
          message: "You don't have permission to update member roles",
          success: false,
        });
      }

      // Get the membership of the user to update
      const membershipToUpdate = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.id, memberId),
          eq(groupMembers.groupId, groupId)
        ),
      });

      if (!membershipToUpdate) {
        return res.status(404).json({
          message: "Group member not found",
          success: false,
        });
      }

      // Check if attempting to change an owner (only owners can change owner status)
      if (
        (membershipToUpdate.role === "owner" || role === "owner") &&
        userMembership.role !== "owner"
      ) {
        return res.status(403).json({
          message: "Only group owners can change owner status",
          success: false,
        });
      }

      // Update the role
      await db
        .update(groupMembers)
        .set({ role, updatedAt: new Date() })
        .where(eq(groupMembers.id, memberId));

      return res.status(200).json({
        message: "Member role updated successfully",
        success: true,
      });
    } catch (error) {
      console.error("Update member role error:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  }
);

// Remove a member from a group
router.delete(
  "/:groupId/members/:memberId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { groupId, memberId } = req.params;
      const { id: userId } = req.user!;

      // Check if the current user has permission (must be an admin or owner)
      const userMembership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (
        !userMembership ||
        !["owner", "admin"].includes(userMembership.role)
      ) {
        return res.status(403).json({
          message: "You don't have permission to remove members",
          success: false,
        });
      }

      // Get the membership to remove
      const membershipToRemove = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.id, memberId),
          eq(groupMembers.groupId, groupId)
        ),
      });

      if (!membershipToRemove) {
        return res.status(404).json({
          message: "Group member not found",
          success: false,
        });
      }

      // Prevent removing an owner if you're not an owner
      if (
        membershipToRemove.role === "owner" &&
        userMembership.role !== "owner"
      ) {
        return res.status(403).json({
          message: "Only group owners can remove other owners",
          success: false,
        });
      }

      // Remove the member
      await db.delete(groupMembers).where(eq(groupMembers.id, memberId));

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
  }
);

export default router;
