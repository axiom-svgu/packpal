# Real-time Updates Troubleshooting Guide

## Common Issues and Solutions

### Maximum Update Depth Error

**Problem:** You see "Maximum update depth exceeded" error in the console.

```
Error: Maximum update depth exceeded. This can happen when a component repeatedly
calls setState inside componentWillUpdate or componentDidUpdate.
React limits the number of nested updates to prevent infinite loops.
```

**Solutions:**

1. **Check hook dependencies:** Make sure your useEffect, useCallback, and useMemo dependencies are correctly specified and don't cause infinite loops.

```jsx
// INCORRECT: This will cause an infinite loop
const { items } = useRealTimeItems({ groupId }); // A new object on each render

// CORRECT: Use a stable reference
const [options] = useState({ groupId }); // Created once, reused on each render
const { items } = useRealTimeItems(options);
```

2. **Memoize components that use real-time hooks:** Use React.memo or useMemo for components that use real-time hooks.

```jsx
// Wrap with useMemo to prevent unnecessary rerenders
{
  useMemo(() => <RealtimeStatus showBadge={true} />, []);
}
```

3. **Use refs for options:** If you need to use options that change frequently, use refs to maintain a stable reference:

```jsx
const optionsRef = useRef({ groupId });

// Update ref when props change
useEffect(() => {
  optionsRef.current.groupId = groupId;
}, [groupId]);

// Use the ref's current value
const fetchData = useCallback(() => {
  const currentGroupId = optionsRef.current.groupId;
  // fetch data using currentGroupId
}, []);
```

### SSE Connection Issues

**Problem:** Real-time updates aren't working, and you see "Connection error" or "Failed to connect" messages.

**Solutions:**

1. **Check CORS configuration:** Ensure your API server has the correct CORS configuration:

```typescript
app.use(
  cors({
    origin: ["your-app-domain.com", "localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

2. **Verify Vercel configuration:** For Vercel deployments, ensure you have the correct SSE configuration in vercel.json:

```json
{
  "routes": [
    {
      "src": "/sse",
      "dest": "/api/app.js",
      "headers": {
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "X-Accel-Buffering": "no"
      }
    }
  ]
}
```

3. **Use polling fallback:** If SSE doesn't work in your environment, ensure the polling fallback is working correctly. You can manually enable it by setting the "enabled" parameter to true in usePollingUpdates.

### Performance Issues

**Problem:** The application becomes slow when real-time updates are enabled.

**Solutions:**

1. **Limit the number of SSE connections:** Try to use a single shared SSE connection at the app level instead of creating connections in many components.

2. **Filter data on the server:** Use the filtering capabilities (filterByGroup, filterByType) to reduce the amount of data sent to the client.

3. **Optimize renders:** Use React.memo, useMemo, and stable references to minimize rerenders.

## Best Practices

1. **Always maintain stable references** to options objects passed to hooks:

   ```jsx
   const [options] = useState({ groupId, categoryId });
   const { items } = useRealTimeItems(options);
   ```

2. **Use the disconnect method** when you no longer need real-time updates:

   ```jsx
   const { disconnect } = useRealtimeUpdates({
     /* options */
   });

   useEffect(() => {
     return () => disconnect(); // Clean up on unmount
   }, [disconnect]);
   ```

3. **Implement proper error handling** to show users when real-time updates aren't working:

   ```jsx
   const { error, connected } = useRealtimeUpdates();

   if (error) {
     return <div>Error connecting to real-time updates: {error}</div>;
   }
   ```

4. **Use the RealtimeStatus component** to show the connection status to users:
   ```jsx
   <RealtimeStatus />
   ```

## Environment-specific Issues

### Vercel

For Vercel deployments, consider:

1. Using Edge Functions with longer execution times
2. Setting appropriate keep-alive headers
3. Using the polling fallback for users in regions with restrictions on long-lived connections

### Development

In development mode, you might see more reconnections due to hot module reloading. This is normal and won't happen in production.
