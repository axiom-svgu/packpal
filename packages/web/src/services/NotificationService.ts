import { useAuthStore } from "@/lib/store";
import { get, put, del } from "./HttpHelper";

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

const baseUrl = "/api/notifications";

export class NotificationService {
  static async getNotifications(
    page = 1,
    limit = 10
  ): Promise<NotificationResponse> {
    const response = await get<NotificationResponse>(
      `${baseUrl}?page=${page}&limit=${limit}`
    );
    return response.data || { notifications: [], total: 0, unreadCount: 0 };
  }

  static async getUnreadCount(): Promise<number> {
    const response = await get<{ count: number }>(`${baseUrl}/unread/count`);
    return response.data?.count || 0;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await put(`${baseUrl}/${notificationId}/read`, {});
  }

  static async markAllAsRead(): Promise<void> {
    await put(`${baseUrl}/read-all`, {});
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    await del(`${baseUrl}/${notificationId}`);
  }
}

// Hook for managing notifications
export function useNotifications() {
  const { user } = useAuthStore();

  const getNotifications = async (page = 1, limit = 10) => {
    if (!user) return { notifications: [], total: 0, unreadCount: 0 };
    return NotificationService.getNotifications(page, limit);
  };

  const getUnreadCount = async () => {
    if (!user) return 0;
    return NotificationService.getUnreadCount();
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    return NotificationService.markAsRead(notificationId);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    return NotificationService.markAllAsRead();
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    return NotificationService.deleteNotification(notificationId);
  };

  return {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
