import { Request, Response } from "express";
import { db } from "../database";
import {
  lists,
  listCreationSchema,
  listUpdateSchema,
} from "../database/schema";
import { groupMembers, groups } from "../database/schema";
import { and, eq, ne } from "drizzle-orm";

// Check if user can manage lists in a group
const canManageLists = async (
  groupId: string,
  userId: string
): Promise<boolean> => {
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId),
      ne(groupMembers.role, "viewer")
    ),
  });

  return !!membership;
};

// Create a new list in a group
export const createList = async (req: Request, res: Response) => {
  try {
    const { name, description, groupId } = listCreationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the group exists
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        success: false,
      });
    }

    // Check if user has permission to create lists in this group
    if (!(await canManageLists(groupId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to create lists in this group",
        success: false,
      });
    }

    // Create the list
    const [list] = await db
      .insert(lists)
      .values({
        name,
        description,
        groupId,
        createdBy: userId,
      })
      .returning();

    return res.status(201).json({
      message: "List created successfully",
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Error creating list:", error);
    return res.status(500).json({
      message: "Failed to create list",
      success: false,
    });
  }
};

// Get all lists for a group
export const getGroupLists = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;
    const includeArchived = req.query.includeArchived === "true";

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the group exists
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
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

    // Query for getting lists
    let query = db.select().from(lists).where(eq(lists.groupId, groupId));

    // Only include non-archived lists unless explicitly requested
    if (!includeArchived) {
      query = db
        .select()
        .from(lists)
        .where(and(eq(lists.groupId, groupId), eq(lists.isArchived, false)));
    }

    const groupLists = await query;

    return res.status(200).json({
      message: "Lists retrieved successfully",
      success: true,
      data: groupLists,
    });
  } catch (error) {
    console.error("Error retrieving lists:", error);
    return res.status(500).json({
      message: "Failed to retrieve lists",
      success: false,
    });
  }
};

// Get a specific list by ID
export const getListById = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
    });

    if (!list) {
      return res.status(404).json({
        message: "List not found",
        success: false,
      });
    }

    // Check if user is a member of the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, list.groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of the group this list belongs to",
        success: false,
      });
    }

    return res.status(200).json({
      message: "List retrieved successfully",
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Error retrieving list:", error);
    return res.status(500).json({
      message: "Failed to retrieve list",
      success: false,
    });
  }
};

// Update a list
export const updateList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const updates = listUpdateSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
    });

    if (!list) {
      return res.status(404).json({
        message: "List not found",
        success: false,
      });
    }

    // Check if user has permission to update lists in this group
    if (!(await canManageLists(list.groupId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to update this list",
        success: false,
      });
    }

    // Update the list
    const [updatedList] = await db
      .update(lists)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(lists.id, listId))
      .returning();

    return res.status(200).json({
      message: "List updated successfully",
      success: true,
      data: updatedList,
    });
  } catch (error) {
    console.error("Error updating list:", error);
    return res.status(500).json({
      message: "Failed to update list",
      success: false,
    });
  }
};

// Archive a list
export const archiveList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
    });

    if (!list) {
      return res.status(404).json({
        message: "List not found",
        success: false,
      });
    }

    // Check if user has permission to archive lists in this group
    if (!(await canManageLists(list.groupId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to archive this list",
        success: false,
      });
    }

    // Update the list
    const [updatedList] = await db
      .update(lists)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(eq(lists.id, listId))
      .returning();

    return res.status(200).json({
      message: "List archived successfully",
      success: true,
      data: updatedList,
    });
  } catch (error) {
    console.error("Error archiving list:", error);
    return res.status(500).json({
      message: "Failed to archive list",
      success: false,
    });
  }
};

// Delete a list
export const deleteList = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
    });

    if (!list) {
      return res.status(404).json({
        message: "List not found",
        success: false,
      });
    }

    // Check user's role in the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, list.groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "admin")
    ) {
      return res.status(403).json({
        message: "You don't have permission to delete this list",
        success: false,
      });
    }

    // Delete the list (cascade should handle related items)
    await db.delete(lists).where(eq(lists.id, listId));

    return res.status(200).json({
      message: "List deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting list:", error);
    return res.status(500).json({
      message: "Failed to delete list",
      success: false,
    });
  }
};
