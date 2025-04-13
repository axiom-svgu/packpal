import express from "express";
import { db } from "../database";
import { notifications } from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { eventEmitter } from "../app";
import { count } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authMiddleware);

// Get all notifications for the current user
router.get("/", async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [notificationResults, countResult] = await Promise.all([
      db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.createdAt)],
        limit,
        offset,
      }),
      db
        .select({ count: count() })
        .from(notifications)
        .where(eq(notifications.userId, userId)),
    ]);

    const unreadCount = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );

    return res.status(200).json({
      notifications: notificationResults,
      total: countResult[0].count,
      unreadCount: unreadCount[0].count,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      message: "Failed to fetch notifications",
      success: false,
    });
  }
});

// Get unread notifications count
router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user!.id;
    const unreadCount = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );

    return res.status(200).json({
      unreadCount: unreadCount[0].count,
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return res.status(500).json({
      message: "Failed to fetch unread notifications count",
      success: false,
    });
  }
});

// Mark a notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );

    // Check if notification was updated
    const updatedNotification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        eq(notifications.isRead, true)
      ),
    });

    if (!updatedNotification) {
      return res.status(404).json({
        message: "Notification not found or not owned by user",
        success: false,
      });
    }

    // Emit notification-update event
    eventEmitter.emit("notification-update", {
      type: "mark-read",
      userId,
      notificationId,
    });

    return res.status(200).json({
      message: "Notification marked as read",
      success: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      message: "Failed to mark notification as read",
      success: false,
    });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get count of unread notifications before update
    const beforeCount = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );

    // Emit notification-update event
    eventEmitter.emit("notification-update", {
      type: "mark-all-read",
      userId,
    });

    return res.status(200).json({
      message: "All notifications marked as read",
      success: true,
      updatedCount: beforeCount[0].count,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return res.status(500).json({
      message: "Failed to mark all notifications as read",
      success: false,
    });
  }
});

// Delete a notification
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    // Check if notification exists before deletion
    const notificationExists = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ),
    });

    if (!notificationExists) {
      return res.status(404).json({
        message: "Notification not found or not owned by user",
        success: false,
      });
    }

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );

    // Emit notification-update event
    eventEmitter.emit("notification-update", {
      type: "delete",
      userId,
      notificationId,
    });

    return res.status(200).json({
      message: "Notification deleted",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      message: "Failed to delete notification",
      success: false,
    });
  }
});

export default router;
