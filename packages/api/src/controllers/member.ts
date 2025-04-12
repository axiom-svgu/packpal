import { Request, Response } from "express";
import { db } from "../database";
import { and, eq, or } from "drizzle-orm";
import { users, groupMembers, groups, groupRoleEnum } from "../database/schema";
import { z } from "zod";

// Validation schemas
export const memberQuerySchema = z.object({
  groupId: z.string().uuid().optional(),
});

export const memberRoleSchema = z.object({
  role: z.enum(["owner", "admin", "member", "viewer"]),
});

export const memberUpdateSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

// Get all members
export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { groupId } = memberQuerySchema.parse(req.query);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    let members;

    if (groupId) {
      // Check if user is part of the group
      const userMembership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        ),
      });

      if (!userMembership) {
        return res.status(403).json({
          message: "You are not a member of this group",
          success: false,
        });
      }

      // Get members of a specific group with user details
      members = await db
        .select({
          id: groupMembers.id,
          userId: groupMembers.userId,
          groupId: groupMembers.groupId,
          role: groupMembers.role,
          joinedAt: groupMembers.joinedAt,
          name: users.name,
          email: users.email,
        })
        .from(groupMembers)
        .leftJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.groupId, groupId));
    } else {
      // Get all members from groups the user is part of
      const userGroups = await db
        .select({ groupId: groupMembers.groupId })
        .from(groupMembers)
        .where(eq(groupMembers.userId, userId));

      const groupIds = userGroups.map((group) => group.groupId);

      if (groupIds.length === 0) {
        return res.status(200).json({
          message: "No groups found",
          success: true,
          data: [],
        });
      }

      members = await db
        .select({
          id: groupMembers.id,
          userId: groupMembers.userId,
          groupId: groupMembers.groupId,
          role: groupMembers.role,
          joinedAt: groupMembers.joinedAt,
          name: users.name,
          email: users.email,
          groupName: groups.name,
        })
        .from(groupMembers)
        .leftJoin(users, eq(groupMembers.userId, users.id))
        .leftJoin(groups, eq(groupMembers.groupId, groups.id))
        .where(
          groupIds.length === 1
            ? eq(groupMembers.groupId, groupIds[0])
            : or(...groupIds.map((id) => eq(groupMembers.groupId, id)))
        );
    }

    return res.status(200).json({
      message: "Members retrieved successfully",
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error retrieving members:", error);
    return res.status(500).json({
      message: "Failed to retrieve members",
      success: false,
    });
  }
};

// Get member details by ID
export const getMemberById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const memberId = req.params.memberId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get member details
    const member = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        groupId: groupMembers.groupId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        name: users.name,
        email: users.email,
        groupName: groups.name,
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .leftJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.id, memberId))
      .limit(1);

    if (!member || member.length === 0) {
      return res.status(404).json({
        message: "Member not found",
        success: false,
      });
    }

    // Check if requesting user is part of the same group
    const userMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, member[0].groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!userMembership) {
      return res.status(403).json({
        message: "You are not authorized to view this member",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Member retrieved successfully",
      success: true,
      data: member[0],
    });
  } catch (error) {
    console.error("Error retrieving member:", error);
    return res.status(500).json({
      message: "Failed to retrieve member",
      success: false,
    });
  }
};

// Update member role
export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const memberId = req.params.memberId;
    const { role } = memberUpdateSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the member to update
    const memberToUpdate = await db.query.groupMembers.findFirst({
      where: eq(groupMembers.id, memberId),
    });

    if (!memberToUpdate) {
      return res.status(404).json({
        message: "Member not found",
        success: false,
      });
    }

    // Check if requesting user has permission (must be owner or admin of the group)
    const userMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, memberToUpdate.groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (
      !userMembership ||
      (userMembership.role !== "owner" && userMembership.role !== "admin")
    ) {
      return res.status(403).json({
        message: "You don't have permission to update member roles",
        success: false,
      });
    }

    // Cannot change owner's role
    if (memberToUpdate.role === "owner") {
      return res.status(403).json({
        message: "Cannot change the role of the group owner",
        success: false,
      });
    }

    // Admin can only change roles of members and viewers
    if (userMembership.role === "admin" && memberToUpdate.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot change the role of other admins",
        success: false,
      });
    }

    // Update the member's role
    await db
      .update(groupMembers)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(groupMembers.id, memberId));

    return res.status(200).json({
      message: "Member role updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return res.status(500).json({
      message: "Failed to update member role",
      success: false,
    });
  }
};

// Remove a member
export const removeMember = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const memberId = req.params.memberId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the member to remove
    const memberToRemove = await db.query.groupMembers.findFirst({
      where: eq(groupMembers.id, memberId),
    });

    if (!memberToRemove) {
      return res.status(404).json({
        message: "Member not found",
        success: false,
      });
    }

    // Check if requesting user has permission (must be owner or admin of the group)
    const userMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, memberToRemove.groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (
      !userMembership ||
      (userMembership.role !== "owner" && userMembership.role !== "admin")
    ) {
      return res.status(403).json({
        message: "You don't have permission to remove members",
        success: false,
      });
    }

    // Cannot remove the owner
    if (memberToRemove.role === "owner") {
      return res.status(403).json({
        message: "Cannot remove the group owner",
        success: false,
      });
    }

    // Admin can only remove members and viewers
    if (userMembership.role === "admin" && memberToRemove.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot remove other admins",
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
    console.error("Error removing member:", error);
    return res.status(500).json({
      message: "Failed to remove member",
      success: false,
    });
  }
};
