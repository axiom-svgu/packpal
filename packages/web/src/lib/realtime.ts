import { useState, useEffect, useCallback, useRef } from "react";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
 * Hook for subscribing to real-time updates via Server-Sent Events
 */
export function useRealtimeUpdates(options: RealtimeServiceOptions = {}) {
  const [connected, setConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [lastEvent, setLastEvent] = useState<RealtimeUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid dependency changes causing reconnects
  const optionsRef = useRef(options);

  // Update the ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    try {
      const token = localStorage.getItem("token");
      const sseUrl = `${baseUrl}/sse`;
      const newEventSource = new EventSource(sseUrl);

      newEventSource.onopen = () => {
        setConnected(true);
        setError(null);
      };

      newEventSource.onerror = (err) => {
        console.error("SSE connection error:", err);
        setConnected(false);
        setError("Connection error");
        // Try to reconnect after a delay
        setTimeout(() => {
          newEventSource.close();
          setEventSource(null); // Clear the event source before reconnecting
        }, 5000);
      };

      newEventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);

          // Skip connection messages
          if (parsedData.type === "connection") {
            return;
          }

          // Use ref for current filter values
          const currentOptions = optionsRef.current;

          // Apply filters if provided
          if (
            currentOptions.filterByGroup &&
            parsedData.data.groupId !== currentOptions.filterByGroup
          ) {
            return;
          }

          if (
            currentOptions.filterByType &&
            !currentOptions.filterByType.includes(parsedData.type)
          ) {
            return;
          }

          setLastEvent(parsedData);

          // Call the onUpdate callback if provided
          if (currentOptions.onUpdate) {
            currentOptions.onUpdate(parsedData);
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err);
        }
      };

      setEventSource(newEventSource);
    } catch (err) {
      console.error("Failed to establish SSE connection:", err);
      setError("Failed to connect");
    }
  }, [eventSource]); // Only depend on eventSource to avoid loops

  // Disconnect from SSE endpoint
  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setConnected(false);
    }
  }, [eventSource]);

  // Only connect/disconnect when the component mounts/unmounts
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when eventSource is null after an error
  useEffect(() => {
    if (!eventSource && !connected) {
      const timeoutId = setTimeout(() => {
        connect();
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [eventSource, connected, connect]);

  return {
    connected,
    lastEvent,
    error,
    disconnect,
    reconnect: connect,
  };
}

/**
 * Fallback polling method for environments where SSE doesn't work
 */
export function usePollingUpdates<T>(
  fetchFunction: () => Promise<T>,
  intervalMs: number = 10000, // Default to 10 seconds
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use refs to avoid dependency changes causing infinite loops
  const fetchFunctionRef = useRef(fetchFunction);
  const enabledRef = useRef(enabled);
  const intervalMsRef = useRef(intervalMs);

  // Update refs when props change
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
    enabledRef.current = enabled;
    intervalMsRef.current = intervalMs;
  }, [fetchFunction, enabled, intervalMs]);

  const fetchData = useCallback(async () => {
    if (!enabledRef.current) return;

    setIsLoading(true);
    try {
      const result = await fetchFunctionRef.current();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error polling for updates:", err);
      setError("Failed to fetch updates");
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies to avoid re-creating this function

  // Initial fetch and polling setup
  useEffect(() => {
    if (!enabledRef.current) return;

    // Fetch immediately
    fetchData();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchData();
    }, intervalMsRef.current);

    // Clean up
    return () => clearInterval(intervalId);
  }, [fetchData]); // Only depend on the fetchData function

  // Force a refresh manually
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
}
