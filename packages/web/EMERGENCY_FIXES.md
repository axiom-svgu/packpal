# Emergency Fixes for Infinite Loop Issues

If you're experiencing the "Maximum update depth exceeded" error, follow these steps to quickly fix the issue.

## What's Happening?

The real-time update functionality is causing an infinite loop in React's rendering cycle. This can happen when:

1. A component renders
2. During render, it triggers a state update (directly or indirectly)
3. That state update causes another render
4. The cycle repeats endlessly

## Quick Fixes

We've created simplified versions of all real-time components and hooks that don't use complex state management. Follow these steps to use them:

### 1. Switch to Disabled Real-time Hooks

We've already created the following files:

- `src/lib/realtime-disabled.ts` - Simplified real-time hooks
- `src/hooks/use-real-time-items-disabled.ts` - Simplified item hooks
- `src/lib/realtime-fix.ts` - Switcher file to control which implementation is used
- `src/hooks/use-real-time-items-fix.ts` - Switcher file for items

### 2. Update Imports

In any file that imports real-time hooks, change the import from:

```typescript
import { useRealtimeUpdates, usePollingUpdates } from "@/lib/realtime";
```

To:

```typescript
import { useRealtimeUpdates, usePollingUpdates } from "@/lib/realtime-fix";
```

And for the items hook, change from:

```typescript
import { useRealTimeItems } from "@/hooks/use-real-time-items";
```

To:

```typescript
import { useRealTimeItems } from "@/hooks/use-real-time-items-fix";
```

### 3. Run a Project-wide Search

Search your project for:

- `from '@/lib/realtime'`
- `from '@/hooks/use-real-time-items'`

And update all imports to use the -fix versions.

## Identifying the Root Cause

Once you've fixed the immediate issue, you can use our debugging utilities to find the root cause:

1. Open `src/utils/debug-infinite-loop.ts`
2. Use the `debugRender`, `debugEffect`, and `debugState` functions in components you suspect are causing issues

Example:

```typescript
import { debugRender } from "@/utils/debug-infinite-loop";

function MyComponent(props) {
  debugRender("MyComponent", props);
  // ... rest of your component
}
```

## Re-enabling Real-time Updates

Once you've identified and fixed the root issue, you can re-enable the real-time functionality by:

1. Opening `src/lib/realtime-fix.ts` and `src/hooks/use-real-time-items-fix.ts`
2. Commenting out the disabled imports
3. Uncommenting the original imports

## Common Root Causes

1. **New objects in every render**: Creating new objects each time a component renders

   ```jsx
   // BAD: Creates a new object on every render
   const { items } = useRealTimeItems({ groupId });

   // GOOD: Stable reference
   const [options] = useState({ groupId });
   const { items } = useRealTimeItems(options);
   ```

2. **Props changing too frequently**: If parent components pass new objects on each render

   ```jsx
   // BAD: Parent creates new object each render
   <RealTimeItems options={{ groupId }} />;

   // GOOD: Parent creates stable reference
   const itemOptions = useMemo(() => ({ groupId }), [groupId]);
   <RealTimeItems options={itemOptions} />;
   ```

3. **Missing dependency arrays**: If useEffect, useCallback, or useMemo are missing dependencies

   ```jsx
   // BAD: Missing dependencies
   useEffect(() => {
     // Code that uses someValue
   }, []); // someValue should be in the dependency array

   // GOOD: Complete dependencies
   useEffect(() => {
     // Code that uses someValue
   }, [someValue]);
   ```

4. **Incorrect dependency arrays**: Including unstable references in dependency arrays

   ```jsx
   // BAD: Unstable object in dependencies
   useEffect(() => {
     // Effect code
   }, [{ id: user.id }]); // New object on each render

   // GOOD: Stable primitive in dependencies
   useEffect(() => {
     // Effect code
   }, [user.id]); // Just the primitive value
   ```
