# PackPal API

Backend service for the PackPal application.

## Tech Stack

- Express.js
- TypeScript
- TypeORM
- PostgreSQL
- Zod for validation
- Bun as the JavaScript runtime

## Real-time Updates Implementation

This API implements real-time updates using Server-Sent Events (SSE) which is compatible with Vercel deployment and doesn't require websockets.

### How it Works

1. **Server-Sent Events (SSE)**: The server establishes a persistent connection with the client and pushes data to clients when updates happen.

2. **Event Emitter**: The API uses Node.js EventEmitter for event-based communication between different parts of the application.

3. **Polling Fallback**: For clients that can't use SSE, the application falls back to regular polling.

### API Endpoints

- **`GET /sse`**: Endpoint for establishing SSE connection

### Event Types

The following event types are supported:

- `item-update`: Changes to items
- `list-update`: Changes to lists
- `category-update`: Changes to categories
- `group-update`: Changes to groups
- `assignment-update`: Changes to assignments

### Update Actions

Each update has one of the following actions:

- `create`: New resource created
- `update`: Existing resource updated
- `delete`: Resource deleted

### Example Event Format

```json
{
  "type": "item-update",
  "data": {
    "action": "create",
    "groupId": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": "2023-11-01T10:30:00.000Z",
    "data": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "name": "New Item"
      // ... other item properties
    }
  }
}
```

## Integration in Frontend

To use real-time updates in the frontend:

1. Use the `useRealtimeUpdates` hook to subscribe to SSE events:

```typescript
import { useRealtimeUpdates } from "@/lib/realtime";

function MyComponent() {
  const { connected, error } = useRealtimeUpdates({
    onUpdate: (update) => {
      // Handle update
      console.log(update);
    },
    filterByGroup: "group-id",
    filterByType: ["item-update"],
  });

  return <div>{connected ? "Connected to real-time" : "Offline"}</div>;
}
```

2. For data-specific real-time updates, use the specialized hooks:

```typescript
import { useRealTimeItems } from "@/hooks/use-real-time-items";

function ItemList({ groupId }) {
  const { items, loading, error } = useRealTimeItems({
    groupId,
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

## Development

To run the API locally:

```bash
cd packages/api
bun install
bun run dev
```
