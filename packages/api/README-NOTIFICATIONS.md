# Real-Time Notifications System

This document explains how the notification system works and how to implement real-time updates in your application.

## Overview

The notification system consists of:

1. **Backend Components**:

   - Database schema for storing notifications
   - REST API endpoints for CRUD operations
   - SSE (Server-Sent Events) for real-time updates

2. **Frontend Components**:
   - Notification service for API communication
   - Real-time update listener
   - UI components for displaying notifications

## Backend Implementation

The backend is already implemented with:

- `notifications` table in the database
- REST API endpoints under `/notifications`
- SSE endpoint for real-time updates
- Notification service utility for creating notifications

### API Endpoints

- `GET /notifications` - Get all notifications for the current user
- `GET /notifications/unread-count` - Get count of unread notifications
- `PUT /notifications/:id/read` - Mark a notification as read
- `PUT /notifications/mark-all-read` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete a notification

## Enabling Real-Time Updates

### Step 1: Set Up SSE Connection in Frontend

Create an SSE connection in your frontend application:

```typescript
// src/services/EventService.ts
export class EventService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.eventSource) {
      this.disconnect();
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";
    this.eventSource = new EventSource(`${baseUrl}/sse`);

    this.eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        this.notifyListeners(eventData.type, eventData.data);
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      // Attempt to reconnect after a delay
      setTimeout(() => this.connect(), 5000);
    };

    return () => this.disconnect();
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  addListener(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  private notifyListeners(eventType: string, data: any) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }
}

export const eventService = new EventService();
```

### Step 2: Update Notification Service to Handle Real-Time Updates

Modify your notification service to handle real-time updates:

```typescript
// src/services/NotificationService.ts
import { eventService } from "./EventService";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedItemId?: string;
  relatedListId?: string;
  relatedGroupId?: string;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export class NotificationService {
  private notifications: Notification[] = [];
  private unreadCount: number = 0;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Set up event listeners for real-time updates
    eventService.addListener(
      "notification-created",
      this.handleNotificationCreated
    );
    eventService.addListener(
      "notification-update",
      this.handleNotificationUpdate
    );
  }

  private handleNotificationCreated = (data: any) => {
    if (data.userId === this.getCurrentUserId()) {
      // Add the new notification to the list
      this.notifications = [data.notification, ...this.notifications];
      this.unreadCount += 1;
      this.notifyListeners();
    }
  };

  private handleNotificationUpdate = (data: any) => {
    if (data.userId === this.getCurrentUserId()) {
      if (data.type === "mark-read") {
        this.notifications = this.notifications.map((notification) =>
          notification.id === data.notificationId
            ? { ...notification, isRead: true }
            : notification
        );
        this.updateUnreadCount();
      } else if (data.type === "mark-all-read") {
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));
        this.unreadCount = 0;
      } else if (data.type === "delete") {
        const deletedNotification = this.notifications.find(
          (n) => n.id === data.notificationId
        );
        this.notifications = this.notifications.filter(
          (n) => n.id !== data.notificationId
        );
        if (deletedNotification && !deletedNotification.isRead) {
          this.updateUnreadCount();
        }
      }
      this.notifyListeners();
    }
  };

  private getCurrentUserId(): string {
    // Get current user ID from your auth context
    // This is a placeholder, implement based on your auth system
    return "current-user-id";
  }

  private updateUnreadCount() {
    this.unreadCount = this.notifications.filter((n) => !n.isRead).length;
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  addListener(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  async getNotifications(): Promise<NotificationResponse> {
    // Implement API call to fetch notifications
    return {
      notifications: this.notifications,
      total: this.notifications.length,
      unreadCount: this.unreadCount,
    };
  }

  async getUnreadCount(): Promise<number> {
    // Implement API call to fetch unread count
    return this.unreadCount;
  }

  async markAsRead(notificationId: string): Promise<void> {
    // Implement API call to mark notification as read
  }

  async markAllAsRead(): Promise<void> {
    // Implement API call to mark all notifications as read
  }

  async deleteNotification(notificationId: string): Promise<void> {
    // Implement API call to delete notification
  }
}

export function useNotifications() {
  // Return your notification service instance or hooks
  return new NotificationService();
}
```

### Step 3: Initialize the SSE Connection

Connect to the SSE endpoint when your application starts:

```typescript
// In your app initialization (e.g., App.tsx or main.tsx)
import { eventService } from "./services/EventService";

// Connect to SSE when the app starts
useEffect(() => {
  const disconnect = eventService.connect();

  return () => {
    disconnect();
  };
}, []);
```

## Creating Notifications

To create notifications from your backend code, use the `NotificationService` utility:

```typescript
import { NotificationService } from "../utils/notificationService";

// Example: Create a notification when a user is assigned an item
async function assignItemToUser(itemId, userId, assignedByUserId) {
  // Your item assignment logic...

  // Get user and item information
  const [user, assignedBy, item] = await Promise.all([
    getUserById(userId),
    getUserById(assignedByUserId),
    getItemById(itemId),
  ]);

  // Create notification
  await NotificationService.createAssignmentNotification({
    userId: userId,
    itemName: item.name,
    itemId: itemId,
    assignedByName: assignedBy.name,
  });
}
```

## Migration and Setup

To set up the notifications system:

1. Make sure the database migration has been run:

   ```
   cd packages/api
   bun run migrate
   ```

2. Restart your backend server to ensure the new routes are registered.

3. Implement the frontend components as described above.

## Testing Real-Time Updates

To test if real-time updates are working:

1. Open two browser windows with your application.
2. Log in with the same user in both windows.
3. Create a notification for this user (e.g., assign an item to them).
4. Verify that the notification appears in both windows without refreshing.
5. Mark a notification as read in one window and verify it updates in the other window.

## Troubleshooting

- **No real-time updates**: Check browser console for SSE connection errors.
- **SSE connection fails**: Ensure CORS is properly configured on the backend.
- **Notifications don't appear**: Verify the user ID matches in the notification event.

For additional help, refer to the implementation files:

- `packages/api/src/routers/notificationRouter.ts`
- `packages/api/src/utils/notificationService.ts`
- `packages/api/src/database/schema.ts` (notifications table)
