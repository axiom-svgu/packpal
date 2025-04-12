import { useState, useEffect, useCallback } from "react";
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

  // Function to fetch items based on groupId or categoryId
  const fetchItems = useCallback(async () => {
    try {
      let endpoint = "/items";

      if (options.groupId) {
        endpoint = `/items/group/${options.groupId}`;
      } else if (options.categoryId) {
        endpoint = `/items/category/${options.categoryId}`;
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
  }, [options.groupId, options.categoryId]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Provide a simple refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refresh,
    realtimeConnected: false,
    lastUpdated: null,
  };
}
