import { Request, Response } from "express";
import { db } from "../database";
import { groups, groupMembers, users } from "../database/schema";
import { and, eq } from "drizzle-orm";
import { groupCreationSchema, groupMemberSchema } from "../database/schema";
import { authMiddleware } from "../middleware/auth";

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
