/**
 * THIS FILE CONTROLS WHICH REALTIME IMPLEMENTATION IS USED
 *
 * If you're experiencing infinite loops, we've created a simplified
 * version of the real-time hooks that don't use complex state management
 * and should help isolate the issue.
 */

// Import from the disabled version to prevent infinite loops
import {
  useRealtimeUpdates,
  usePollingUpdates,
  type RealtimeUpdate,
} from "./realtime-disabled";

// Original implementation (currently disabled)
// import {
//   useRealtimeUpdates,
//   usePollingUpdates,
//   type RealtimeUpdate
// } from './realtime';

export { useRealtimeUpdates, usePollingUpdates, type RealtimeUpdate };
