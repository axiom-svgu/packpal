import { Request, Response } from "express";
import { db } from "../database";
import {
  lists,
  listItems,
  listItemAssignments,
  listItemCreationSchema,
  listItemUpdateSchema,
  listItemAssignmentSchema,
} from "../database/lists-schema";
import { groupMembers } from "../database/schema";
import { and, eq, ne } from "drizzle-orm";

// Check if user can manage items in a list
const canManageListItems = async (
  listId: string,
  userId: string
): Promise<boolean> => {
  const list = await db.query.lists.findFirst({
    where: eq(lists.id, listId),
  });

  if (!list) return false;

  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, list.groupId),
      eq(groupMembers.userId, userId),
      ne(groupMembers.role, "viewer")
    ),
  });

  return !!membership;
};

// Create a new list item
export const createListItem = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const { title, description, status, dueDate, assignedTo } =
      listItemCreationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the list exists
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
    });

    if (!list) {
      return res.status(404).json({
        message: "List not found",
        success: false,
      });
    }

    // Check if user has permission to add items to this list
    if (!(await canManageListItems(listId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to add items to this list",
        success: false,
      });
    }

    // Parse due date if provided
    let parsedDueDate = undefined;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
    }

    // Create the list item
    const [listItem] = await db
      .insert(listItems)
      .values({
        title,
        description,
        listId,
        status: status || "todo",
        dueDate: parsedDueDate,
        createdBy: userId,
      })
      .returning();

    // If there are assigned users, create the assignments
    if (assignedTo && assignedTo.length > 0) {
      for (const assigneeId of assignedTo) {
        await db.insert(listItemAssignments).values({
          listItemId: listItem.id,
          userId: assigneeId,
          assignedBy: userId,
        });
      }
    }

    return res.status(201).json({
      message: "List item created successfully",
      success: true,
      data: listItem,
    });
  } catch (error) {
    console.error("Error creating list item:", error);
    return res.status(500).json({
      message: "Failed to create list item",
      success: false,
    });
  }
};

// Get all items in a list
export const getListItems = async (req: Request, res: Response) => {
  try {
    const { listId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Check if the list exists
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

    // Get all items in the list
    const items = await db.query.listItems.findMany({
      where: eq(listItems.listId, listId),
    });

    // Get assignments for each item
    const itemsWithAssignments = await Promise.all(
      items.map(async (item) => {
        // For each item, just return the item for now
        // In the future, we can enhance this to include assignments and user details
        return item;
      })
    );

    return res.status(200).json({
      message: "List items retrieved successfully",
      success: true,
      data: itemsWithAssignments,
    });
  } catch (error) {
    console.error("Error retrieving list items:", error);
    return res.status(500).json({
      message: "Failed to retrieve list items",
      success: false,
    });
  }
};

// Get a specific list item by ID
export const getListItemById = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list item
    const item = await db.query.listItems.findFirst({
      where: eq(listItems.id, itemId),
    });

    if (!item) {
      return res.status(404).json({
        message: "List item not found",
        success: false,
      });
    }

    // Get the list
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, item.listId),
    });

    if (!list) {
      return res.status(404).json({
        message: "Parent list not found",
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
        message: "You are not a member of the group this item belongs to",
        success: false,
      });
    }

    // Get assignments for the item
    const assignments = await db.query.listItemAssignments.findMany({
      where: eq(listItemAssignments.listItemId, itemId),
    });

    // In the future we can enhance this to include user details for each assignment

    return res.status(200).json({
      message: "List item retrieved successfully",
      success: true,
      data: {
        ...item,
        assignments,
      },
    });
  } catch (error) {
    console.error("Error retrieving list item:", error);
    return res.status(500).json({
      message: "Failed to retrieve list item",
      success: false,
    });
  }
};

// Update a list item
export const updateListItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const updates = listItemUpdateSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list item
    const item = await db.query.listItems.findFirst({
      where: eq(listItems.id, itemId),
    });

    if (!item) {
      return res.status(404).json({
        message: "List item not found",
        success: false,
      });
    }

    // Check if user has permission to update items in this list
    if (!(await canManageListItems(item.listId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to update this item",
        success: false,
      });
    }

    // Parse due date if provided
    let parsedDueDate = undefined;
    if (updates.dueDate) {
      parsedDueDate = new Date(updates.dueDate);
    }

    // Update the list item
    const [updatedItem] = await db
      .update(listItems)
      .set({
        ...updates,
        dueDate: parsedDueDate,
        updatedAt: new Date(),
      })
      .where(eq(listItems.id, itemId))
      .returning();

    return res.status(200).json({
      message: "List item updated successfully",
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating list item:", error);
    return res.status(500).json({
      message: "Failed to update list item",
      success: false,
    });
  }
};

// Delete a list item
export const deleteListItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list item
    const item = await db.query.listItems.findFirst({
      where: eq(listItems.id, itemId),
    });

    if (!item) {
      return res.status(404).json({
        message: "List item not found",
        success: false,
      });
    }

    // Check if user has permission to delete items in this list
    if (!(await canManageListItems(item.listId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to delete this item",
        success: false,
      });
    }

    // Delete the list item (cascade should handle assignments)
    await db.delete(listItems).where(eq(listItems.id, itemId));

    return res.status(200).json({
      message: "List item deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting list item:", error);
    return res.status(500).json({
      message: "Failed to delete list item",
      success: false,
    });
  }
};

// Assign a user to a list item
export const assignUserToItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { userId: assigneeId } = listItemAssignmentSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list item
    const item = await db.query.listItems.findFirst({
      where: eq(listItems.id, itemId),
    });

    if (!item) {
      return res.status(404).json({
        message: "List item not found",
        success: false,
      });
    }

    // Check if user has permission to assign users to this item
    if (!(await canManageListItems(item.listId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to assign users to this item",
        success: false,
      });
    }

    // Get the list and group
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, item.listId),
    });

    if (!list) {
      return res.status(404).json({
        message: "Parent list not found",
        success: false,
      });
    }

    // Check if the assignee is a member of the group
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, list.groupId),
        eq(groupMembers.userId, assigneeId)
      ),
    });

    if (!membership) {
      return res.status(400).json({
        message:
          "The user you're trying to assign is not a member of this group",
        success: false,
      });
    }

    // Check if the user is already assigned to this item
    const existingAssignment = await db.query.listItemAssignments.findFirst({
      where: and(
        eq(listItemAssignments.listItemId, itemId),
        eq(listItemAssignments.userId, assigneeId)
      ),
    });

    if (existingAssignment) {
      return res.status(400).json({
        message: "User is already assigned to this item",
        success: false,
      });
    }

    // Create the assignment
    const [assignment] = await db
      .insert(listItemAssignments)
      .values({
        listItemId: itemId,
        userId: assigneeId,
        assignedBy: userId,
      })
      .returning();

    return res.status(201).json({
      message: "User assigned successfully",
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Error assigning user to item:", error);
    return res.status(500).json({
      message: "Failed to assign user to item",
      success: false,
    });
  }
};

// Unassign a user from a list item
export const unassignUserFromItem = async (req: Request, res: Response) => {
  try {
    const { itemId, assigneeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    // Get the list item
    const item = await db.query.listItems.findFirst({
      where: eq(listItems.id, itemId),
    });

    if (!item) {
      return res.status(404).json({
        message: "List item not found",
        success: false,
      });
    }

    // Check if user has permission to unassign users from this item
    if (!(await canManageListItems(item.listId, userId))) {
      return res.status(403).json({
        message: "You don't have permission to unassign users from this item",
        success: false,
      });
    }

    // Delete the assignment
    await db
      .delete(listItemAssignments)
      .where(
        and(
          eq(listItemAssignments.listItemId, itemId),
          eq(listItemAssignments.userId, assigneeId)
        )
      );

    return res.status(200).json({
      message: "User unassigned successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error unassigning user from item:", error);
    return res.status(500).json({
      message: "Failed to unassign user from item",
      success: false,
    });
  }
};
