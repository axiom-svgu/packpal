import { useState, useEffect } from "react";
import { Truck } from "lucide-react";
import { TodoList } from "@/components/todo-list";
import { useAuth } from "@/hooks/use-auth";
import { fetchAssignmentsByUser } from "@/services/ItemAssignmentService";

export default function DeliveredPage() {
  const [itemCount, setItemCount] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchItemCount();
    }
  }, [user]);

  const fetchItemCount = async () => {
    if (!user) return;

    try {
      const items = await fetchAssignmentsByUser(user.id);
      const deliveredItems = items.filter(
        (item) => item.status === "delivered"
      );
      setItemCount(deliveredItems.length);
    } catch (error) {
      console.error("Error fetching items count:", error);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Delivered Items</h2>
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">
            Delivered Items: {itemCount}
          </span>
        </div>
      </div>

      {user && <TodoList status="delivered" userId={user.id} />}
    </div>
  );
}
