/**
 * THIS FILE CONTROLS WHICH REALTIME ITEMS IMPLEMENTATION IS USED
 *
 * If you're experiencing infinite loops, we've created a simplified
 * version of the hook that doesn't use complex state management
 * and should help isolate the issue.
 */

// Import from the disabled version to prevent infinite loops
import { useRealTimeItems } from "./use-real-time-items-disabled";

// Original implementation (currently disabled)
// import { useRealTimeItems } from './use-real-time-items';

export { useRealTimeItems };
