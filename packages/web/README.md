# PackPal Web Application

Frontend web application for PackPal.

## Tech Stack

- React
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- ShadCN UI

## Real-time Updates

This application implements real-time updates using Server-Sent Events (SSE) with a polling fallback mechanism.

### How it Works

1. **Primary Method: Server-Sent Events (SSE)**: The application establishes a persistent connection with the server and receives updates as they happen.

2. **Fallback: Polling**: If SSE is not available (e.g., due to browser/network limitations), the app automatically falls back to regular polling.

### Available Hooks

#### 1. Base Real-time Hook

```typescript
import { useRealtimeUpdates } from "@/lib/realtime";

function MyComponent() {
  const {
    connected, // Boolean indicating if SSE is connected
    lastEvent, // The last event received
    error, // Any connection error
    disconnect, // Function to manually disconnect
    reconnect, // Function to manually reconnect
  } = useRealtimeUpdates({
    onUpdate: (update) => {
      // Handle update event
      console.log(update);
    },
    filterByGroup: "group-id", // Optional: filter by group
    filterByType: ["item-update"], // Optional: filter by event type
  });

  return <div>{connected ? "Real-time active" : "Offline mode"}</div>;
}
```

#### 2. Data-Specific Hooks

For specific data types, use the specialized hooks:

**Items:**

```typescript
import { useRealTimeItems } from "@/hooks/use-real-time-items";

function ItemList() {
  const {
    items, // Real-time updated items
    loading, // Loading state
    error, // Any error
    refresh, // Manual refresh function
    realtimeConnected, // Whether real-time is connected
    lastUpdated, // Timestamp of last update (with polling)
  } = useRealTimeItems({
    groupId: "group-id", // Optional: filter by group
    categoryId: "category-id", // Optional: filter by category
    pollingInterval: 30000, // Optional: custom polling interval
    initialItems: [], // Optional: initial items
  });

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Real-time Status Component

To display the real-time connection status to users:

```tsx
import { RealtimeStatus } from "@/components/ui/realtime-status";

function MyLayout() {
  return (
    <div className="flex justify-between items-center p-4">
      <h1>My App</h1>
      <RealtimeStatus />
    </div>
  );
}
```

The `RealtimeStatus` component accepts these props:

- `showBadge`: Whether to show the status badge (default: true)
- `showIcon`: Whether to show the connection icon (default: true)
- `compact`: Use a compact display (default: false)

## Development

To run the application locally:

```bash
cd packages/web
bun install
bun run dev
```
