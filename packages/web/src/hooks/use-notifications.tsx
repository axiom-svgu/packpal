import { useEffect, useState } from "react";
import {
  useNotifications as useNotificationService,
  Notification,
} from "@/services/NotificationService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const notificationService = useNotificationService();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setError(null);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(
        notifications.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const updatedNotifications = notifications.filter(
        (n) => n.id !== notificationId
      );
      setNotifications(updatedNotifications);

      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();

    // Set up polling for unread count every minute
    const intervalId = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
