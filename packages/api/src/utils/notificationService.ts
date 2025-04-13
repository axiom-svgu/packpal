import { db } from "../database";
import {
  notifications,
  NewNotification,
  NotificationType,
} from "../database/schema";
import { eventEmitter } from "../app";

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedItemId?: string;
    relatedListId?: string;
    relatedGroupId?: string;
  }): Promise<string> {
    try {
      const [notification] = await db
        .insert(notifications)
        .values({
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          relatedItemId: data.relatedItemId,
          relatedListId: data.relatedListId,
          relatedGroupId: data.relatedGroupId,
          isRead: false,
        })
        .returning();

      // Emit event for real-time updates
      eventEmitter.emit("notification-created", {
        userId: data.userId,
        notification: notification,
      });

      return notification.id;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  /**
   * Create item assignment notification
   */
  static async createAssignmentNotification(data: {
    userId: string;
    itemName: string;
    itemId: string;
    assignedByName: string;
  }) {
    return this.createNotification({
      userId: data.userId,
      title: "New Item Assignment",
      message: `${data.assignedByName} assigned "${data.itemName}" to you`,
      type: "assignment",
      relatedItemId: data.itemId,
    });
  }

  /**
   * Create item update notification
   */
  static async createItemUpdateNotification(data: {
    userId: string;
    itemName: string;
    itemId: string;
    updateType: "updated" | "deleted" | "created";
    updatedByName: string;
  }) {
    const action =
      data.updateType === "created"
        ? "created"
        : data.updateType === "updated"
        ? "updated"
        : "deleted";

    return this.createNotification({
      userId: data.userId,
      title: "Item Update",
      message: `${data.updatedByName} ${action} the item "${data.itemName}"`,
      type: "item_update",
      relatedItemId: data.itemId,
    });
  }

  /**
   * Create list update notification
   */
  static async createListUpdateNotification(data: {
    userId: string;
    listName: string;
    listId: string;
    updateType: "updated" | "deleted" | "created";
    updatedByName: string;
  }) {
    const action =
      data.updateType === "created"
        ? "created"
        : data.updateType === "updated"
        ? "updated"
        : "deleted";

    return this.createNotification({
      userId: data.userId,
      title: "List Update",
      message: `${data.updatedByName} ${action} the list "${data.listName}"`,
      type: "list_update",
      relatedListId: data.listId,
    });
  }

  /**
   * Create group update notification
   */
  static async createGroupUpdateNotification(data: {
    userId: string;
    groupName: string;
    groupId: string;
    updateType: "updated" | "deleted" | "added" | "removed";
    updatedByName: string;
  }) {
    let message = "";

    if (data.updateType === "added") {
      message = `${data.updatedByName} added you to the group "${data.groupName}"`;
    } else if (data.updateType === "removed") {
      message = `${data.updatedByName} removed you from the group "${data.groupName}"`;
    } else {
      const action = data.updateType === "updated" ? "updated" : "deleted";
      message = `${data.updatedByName} ${action} the group "${data.groupName}"`;
    }

    return this.createNotification({
      userId: data.userId,
      title: "Group Update",
      message,
      type: "group_update",
      relatedGroupId: data.groupId,
    });
  }

  /**
   * Create a system notification
   */
  static async createSystemNotification(data: {
    userId: string;
    title: string;
    message: string;
  }) {
    return this.createNotification({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: "system",
    });
  }
}
