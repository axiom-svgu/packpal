import { useState, useCallback } from "react";

export interface RealtimeUpdate {
  type:
    | "item-update"
    | "list-update"
    | "category-update"
    | "group-update"
    | "assignment-update";
  action: "create" | "update" | "delete";
  groupId?: string;
  timestamp: string;
  data: any;
}

interface RealtimeServiceOptions {
  onUpdate?: (update: RealtimeUpdate) => void;
  filterByGroup?: string;
  filterByType?: string[];
}

/**
 * DISABLED version of the hook for subscribing to real-time updates
 * This returns static values to prevent any potential infinite loops
 */
export function useRealtimeUpdates(_: RealtimeServiceOptions = {}) {
  // Return static values
  return {
    connected: false,
    lastEvent: null,
    error: "Real-time updates are temporarily disabled",
    disconnect: () => {},
    reconnect: () => {},
  };
}

/**
 * DISABLED version of polling updates
 * This returns static values to prevent any potential infinite loops
 */
export function usePollingUpdates<T>(fetchFunction: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);

  // Simple manual refresh function that only fetches once
  const refresh = useCallback(async () => {
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [fetchFunction]);

  return {
    data,
    isLoading: false,
    error: "Real-time polling is temporarily disabled",
    lastUpdated: null,
    refresh,
  };
}
