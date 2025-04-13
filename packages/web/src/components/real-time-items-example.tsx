import { useState, useCallback } from "react";
import { useRealTimeItems } from "@/hooks/use-real-time-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RealtimeStatus } from "@/components/ui/realtime-status";

interface RealTimeItemsListProps {
  groupId?: string;
  categoryId?: string;
  title?: string;
}

export function RealTimeItemsList({
  groupId,
  categoryId,
  title = "Items",
}: RealTimeItemsListProps) {
  // Options object should remain stable to prevent re-renders
  const [options] = useState({
    groupId,
    categoryId,
    pollingInterval: 30000,
  });

  const { items, loading, error, refresh, lastUpdated } =
    useRealTimeItems(options);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {title} ({items.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <RealtimeStatus compact showBadge={false} />
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-red-500 p-3 rounded-md text-center">
            Error: {error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground text-center py-6">
            No items found
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description || "No description"}
                  </div>
                </div>
                <div className="text-sm">{item.quantity}</div>
              </div>
            ))}
          </div>
        )}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground text-right mt-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
