import React, { useState, useEffect } from "react";
import { Package, CheckCircle, Truck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAssignmentsByUser,
  updateAssignmentStatus,
} from "@/services/ItemAssignmentService";
import { ItemAssignment, ItemStatus } from "@/services/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define the statuses
const STATUSES: ItemStatus[] = ["to_pack", "packed", "delivered"];

// TaskCard component
function TaskCard({
  assignment,
  isDragging,
}: {
  assignment: ItemAssignment;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: assignment.id,
      data: {
        assignment,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formattedDate = new Date(assignment.createdAt).toLocaleDateString();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2 cursor-grab"
    >
      <Card className="border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="px-2">
          <div className="font-medium text-base">{assignment.item?.name}</div>

          {assignment.item?.description && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
              {assignment.item.description}
            </div>
          )}

          <div className="flex justify-between items-center mt-1">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Qty:</span>{" "}
              {assignment.item?.quantity}
            </div>

            {assignment.user && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Assigned to:</span>{" "}
                {assignment.user.name}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {assignment.item?.category && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {assignment.item.category.name}
              </Badge>
            )}

            {assignment.notes && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                Has notes
              </Badge>
            )}

            <Badge variant="outline" className="text-xs px-1 py-0 ml-auto">
              Added: {formattedDate}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Column component
function Column({
  title,
  status,
  assignments,
  icon,
}: {
  title: string;
  status: ItemStatus;
  assignments: ItemAssignment[];
  icon: React.ReactNode;
}) {
  return (
    <Card className="w-full h-full">
      <CardHeader className="py-0">
        <CardTitle className="text-base flex items-center gap-1">
          {icon}
          <span>{title}</span>
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
            {assignments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent
        className="pt-2 px-2 overflow-y-auto"
        style={{ height: "calc(100% - 55px)" }}
        id={`column-${status}`}
      >
        <SortableContext
          items={assignments.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {assignments.length === 0 ? (
            <div className="text-center text-gray-500 text-sm">No items</div>
          ) : (
            assignments.map((assignment) => (
              <TaskCard key={assignment.id} assignment={assignment} />
            ))
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export default function KanbanPage() {
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAssignment, setActiveAssignment] =
    useState<ItemAssignment | null>(null);
  const { user } = useAuth();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const items = await fetchAssignmentsByUser(user.id);
      setAssignments(items);
      setError(null);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  // Group assignments by status
  const assignmentsByStatus = STATUSES.reduce<
    Record<ItemStatus, ItemAssignment[]>
  >(
    (acc, status) => {
      acc[status] = assignments.filter((item) => item.status === status);
      return acc;
    },
    { to_pack: [], packed: [], delivered: [] }
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const assignment = assignments.find((a) => a.id === active.id);
    if (assignment) {
      setActiveAssignment(assignment);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAssignment(null);

    if (!over) return;

    // Find the active assignment that's being dragged
    const activeAssignment = assignments.find((a) => a.id === active.id);
    if (!activeAssignment) return;

    // Extract the column id from the over.id if it's in the format "column-{status}"
    const overIdStr = String(over.id);
    let newStatus: ItemStatus | null = null;

    // Check if dropped directly on a column
    if (overIdStr.startsWith("column-")) {
      newStatus = overIdStr.replace("column-", "") as ItemStatus;
    } else {
      // If dropped on an item, find the column of that item
      const overAssignment = assignments.find((a) => a.id === overIdStr);
      if (overAssignment) {
        newStatus = overAssignment.status;
      }
    }

    // If we have a valid new status and it's different from the current status
    if (newStatus && newStatus !== activeAssignment.status) {
      try {
        // Update the status in the backend
        await updateAssignmentStatus(activeAssignment.id, {
          status: newStatus,
        });
        // Refresh the data
        fetchItems();
      } catch (error) {
        console.error("Failed to update item status:", error);
        setError("Failed to update item status");
      }
    }
  };

  const getColumnIcon = (status: ItemStatus) => {
    switch (status) {
      case "to_pack":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "packed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "delivered":
        return <Truck className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getColumnTitle = (status: ItemStatus) => {
    switch (status) {
      case "to_pack":
        return "To Pack";
      case "packed":
        return "Packed";
      case "delivered":
        return "Delivered";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex-1 p-4 pt-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold tracking-tight">
          Item Tracking Board
        </h2>
        <Button onClick={fetchItems} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <p>Loading items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[calc(100vh-150px)]">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            id="kanban-board"
          >
            {STATUSES.map((status) => (
              <Column
                key={status}
                title={getColumnTitle(status)}
                status={status}
                assignments={assignmentsByStatus[status]}
                icon={getColumnIcon(status)}
              />
            ))}

            <DragOverlay>
              {activeAssignment && (
                <TaskCard assignment={activeAssignment} isDragging />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
