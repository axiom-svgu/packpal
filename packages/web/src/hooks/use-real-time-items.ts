import { useState, useEffect, useCallback, useRef } from "react";
import {
  useRealtimeUpdates,
  usePollingUpdates,
  RealtimeUpdate,
} from "@/lib/realtime";
import { Item } from "@/services/types";
import { get } from "@/services/HttpHelper";

interface UseRealTimeItemsOptions {
  groupId?: string;
  categoryId?: string;
  pollingInterval?: number;
  initialItems?: Item[];
}

export function useRealTimeItems(options: UseRealTimeItemsOptions = {}) {
  const [items, setItems] = useState<Item[]>(options.initialItems || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid dependency changes causing unnecessary refetches
  const optionsRef = useRef(options);

  // Update ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Function to fetch items based on groupId or categoryId
  const fetchItems = useCallback(async () => {
    try {
      let endpoint = "/items";
      const currentOptions = optionsRef.current;

      if (currentOptions.groupId) {
        endpoint = `/items/group/${currentOptions.groupId}`;
      } else if (currentOptions.categoryId) {
        endpoint = `/items/category/${currentOptions.categoryId}`;
      } else {
        // No filter provided, return empty array
        setItems([]);
        setLoading(false);
        return [];
      }

      const response = await get<Item[]>(endpoint);

      if (response.error) {
        setError(response.error);
        return [];
      }

      setItems(response.data || []);
      setLoading(false);
      return response.data || [];
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items");
      setLoading(false);
      return [];
    }
  }, []); // No dependencies to avoid refetching when options change

  // Setup initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle real-time updates with SSE
  const handleRealTimeUpdate = useCallback(
    (update: RealtimeUpdate) => {
      if (update.type !== "item-update") return;

      const { action, data } = update;
      const currentOptions = optionsRef.current;

      setItems((currentItems) => {
        if (action === "create") {
          // Only add if it matches our filters
          if (currentOptions.groupId && data.groupId !== currentOptions.groupId)
            return currentItems;
          if (
            currentOptions.categoryId &&
            data.categoryId !== currentOptions.categoryId
          )
            return currentItems;

          // Check if item already exists to avoid duplicates
          if (currentItems.some((item) => item.id === data.id))
            return currentItems;

          return [...currentItems, data];
        }

        if (action === "update") {
          return currentItems.map((item) =>
            item.id === data.id ? { ...item, ...data } : item
          );
        }

        if (action === "delete") {
          return currentItems.filter((item) => item.id !== data.id);
        }

        return currentItems;
      });
    },
    [] // No dependencies to avoid re-creating this function
  );

  // Use SSE for real-time updates
  const { connected: sseConnected, error: sseError } = useRealtimeUpdates({
    onUpdate: handleRealTimeUpdate,
    filterByGroup: options.groupId,
    filterByType: ["item-update"],
  });

  // Use polling as a fallback if SSE is not working
  const { lastUpdated: pollingLastUpdated, error: pollingError } =
    usePollingUpdates(
      fetchItems,
      options.pollingInterval || 30000, // Default to 30 seconds
      !sseConnected // Only enable polling if SSE is not connected
    );

  const refresh = useCallback(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error: error || sseError || pollingError,
    refresh,
    realtimeConnected: sseConnected,
    lastUpdated: pollingLastUpdated,
  };
}
