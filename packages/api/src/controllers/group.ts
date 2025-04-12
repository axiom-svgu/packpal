import { Request, Response } from "express";
import { db } from "../database";
import { groups, groupMembers, users } from "../database/schema";
import { and, eq, ne } from "drizzle-orm";
import { groupCreationSchema, groupMemberSchema } from "../database/schema";
import { authMiddleware } from "../middleware/auth";

export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get all groups where the user is a member
    const userGroups = await db
      .select({
        group: groups,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId));

    const mappedGroups = userGroups.map((ug) => ug.group);

    return res.status(200).json({
      message: "Groups retrieved successfully",
      success: true,
      data: mappedGroups,
    });
  } catch (error) {
    console.error("Error getting groups:", error);
    return res.status(500).json({
      message: "Failed to retrieve groups",
      success: false,
    });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if user is a member of the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this group",
        success: false,
      });
    }

    // Get the group details
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Group retrieved successfully",
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error getting group:", error);
    return res.status(500).json({
      message: "Failed to retrieve group",
      success: false,
    });
  }
};

export const getGroupMembers = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if user is a member of the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this group",
        success: false,
      });
    }

    // Get all members with their user information
    const members = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        user: users,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId));

    return res.status(200).json({
      message: "Group members retrieved successfully",
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error getting group members:", error);
    return res.status(500).json({
      message: "Failed to retrieve group members",
      success: false,
    });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the remover has sufficient permissions
    const removerMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (
      !removerMembership ||
      (removerMembership.role !== "owner" && removerMembership.role !== "admin")
    ) {
      return res.status(403).json({
        message: "Insufficient permissions to remove members",
        success: false,
      });
    }

    // Check if target is an owner (owners can't be removed)
    const targetMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, memberId)
      ),
    });

    if (!targetMembership) {
      return res.status(404).json({
        message: "Member not found",
        success: false,
      });
    }

    if (targetMembership.role === "owner") {
      return res.status(403).json({
        message: "Group owners cannot be removed",
        success: false,
      });
    }

    // Remove the member
    await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, memberId)
        )
      );

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

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, description } = groupCreationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Create the group
    const [group] = await db
      .insert(groups)
      .values({
        name,
        description,
        createdBy: userId,
      })
      .returning();

    // Add the creator as owner
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: userId,
      role: "owner",
    });

    return res.status(201).json({
      message: "Group created successfully",
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({
      message: "Failed to create group",
      success: false,
    });
  }
};

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { email, role } = groupMemberSchema.parse(req.body);
    const groupId = req.params.groupId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the inviter has sufficient permissions
    const inviterMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!inviterMembership || inviterMembership.role === "viewer") {
      return res.status(403).json({
        message: "Insufficient permissions to invite members",
        success: false,
      });
    }

    // Find the user by email
    const invitedUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!invitedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if user is trying to invite themselves
    if (invitedUser.id === userId) {
      return res.status(400).json({
        message: "You cannot invite yourself to a group you're already in",
        success: false,
      });
    }

    // Check if user is already a member
    const existingMember = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, invitedUser.id)
      ),
    });

    if (existingMember) {
      return res.status(400).json({
        message: "User is already a member of this group",
        success: false,
      });
    }

    // Add the user as a member
    await db.insert(groupMembers).values({
      groupId,
      userId: invitedUser.id,
      role,
    });

    return res.status(200).json({
      message: "Member invited successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error inviting member:", error);
    return res.status(500).json({
      message: "Failed to invite member",
      success: false,
    });
  }
};

export const updateMemberRole = async (req: Request, res: Response) => {
  try {
    const { role } = groupMemberSchema.parse(req.body);
    const { groupId, memberId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the updater has sufficient permissions
    const updaterMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!updaterMembership || updaterMembership.role === "viewer") {
      return res.status(403).json({
        message: "Insufficient permissions to update roles",
        success: false,
      });
    }

    // Check if the target member exists
    const targetMembership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, memberId)
      ),
    });

    if (!targetMembership) {
      return res.status(404).json({
        message: "Member not found",
        success: false,
      });
    }

    // Prevent modifying owner role
    if (targetMembership.role === "owner") {
      return res.status(403).json({
        message: "Group owner's role cannot be changed",
        success: false,
      });
    }

    // Prevent owners from being demoted
    if (
      memberId === userId &&
      updaterMembership.role === "owner" &&
      role !== "owner"
    ) {
      return res.status(403).json({
        message: "You cannot demote yourself as owner",
        success: false,
      });
    }

    // Update the member's role
    await db
      .update(groupMembers)
      .set({ role })
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, memberId)
        )
      );

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

export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the user is a member of the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(404).json({
        message: "You are not a member of this group",
        success: false,
      });
    }

    // Prevent owners from leaving without transferring ownership
    if (membership.role === "owner") {
      // Check if there are other members who could become owners
      const otherMembers = await db.query.groupMembers.findMany({
        where: and(
          eq(groupMembers.groupId, groupId),
          ne(groupMembers.userId, userId)
        ),
      });

      if (otherMembers.length === 0) {
        // If no other members, delete the group instead
        await db.delete(groups).where(eq(groups.id, groupId));

        return res.status(200).json({
          message: "You were the only member. Group has been deleted.",
          success: true,
        });
      }

      return res.status(403).json({
        message: "You must transfer ownership before leaving the group",
        success: false,
      });
    }

    // Remove the user from the group
    await db
      .delete(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      );

    return res.status(200).json({
      message: "You have left the group successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    return res.status(500).json({
      message: "Failed to leave group",
      success: false,
    });
  }
};
