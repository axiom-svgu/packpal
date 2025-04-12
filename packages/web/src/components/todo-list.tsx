import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Package, Truck } from "lucide-react";
import { ItemAssignment, ItemStatus } from "@/services/types";
import {
  fetchAssignmentsByUser,
  updateAssignmentStatus,
} from "@/services/ItemAssignmentService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TodoListProps {
  status: ItemStatus;
  userId: string;
}

export function TodoList({ status, userId }: TodoListProps) {
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAssignments();
    }
  }, [userId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await fetchAssignmentsByUser(userId);
      // Filter items by status
      const filteredData = data.filter((item) => item.status === status);
      setAssignments(filteredData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    assignmentId: string,
    newStatus: ItemStatus
  ) => {
    try {
      await updateAssignmentStatus(assignmentId, { status: newStatus });
      fetchAssignments(); // Refresh the data
    } catch (err) {
      setError("Failed to update item status");
      console.error(err);
    }
  };

  const getNextStatus = (currentStatus: ItemStatus): ItemStatus | null => {
    switch (currentStatus) {
      case "to_pack":
        return "packed";
      case "packed":
        return "delivered";
      default:
        return null;
    }
  };

  const getStatusIcon = (itemStatus: ItemStatus) => {
    switch (itemStatus) {
      case "to_pack":
        return <Package className="h-4 w-4 text-yellow-500" />;
      case "packed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "delivered":
        return <Truck className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (itemStatus: ItemStatus) => {
    switch (itemStatus) {
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

  const getNextActionButton = (assignment: ItemAssignment) => {
    const nextStatus = getNextStatus(assignment.status);
    if (!nextStatus) return null;

    const actionText =
      nextStatus === "packed" ? "Mark Packed" : "Mark Delivered";
    const icon =
      nextStatus === "packed" ? (
        <CheckCircle className="mr-2 h-4 w-4" />
      ) : (
        <Truck className="mr-2 h-4 w-4" />
      );

    return (
      <Button
        size="sm"
        onClick={() => handleUpdateStatus(assignment.id, nextStatus)}
        className={
          nextStatus === "packed"
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-green-500 hover:bg-green-600"
        }
      >
        {icon}
        {actionText}
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {getStatusIcon(status)}
          <span className="ml-2">{getStatusText(status)} Items</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <p>Loading items...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">
              No {getStatusText(status).toLowerCase()} items
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {status === "to_pack"
                ? "Items will appear here when they are assigned to you."
                : status === "packed"
                ? "When you pack items, they will appear here."
                : "Items will appear here when they are delivered."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Category</TableHead>
                {status !== "delivered" && <TableHead>Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">
                    {assignment.item?.name}
                  </TableCell>
                  <TableCell>{assignment.item?.quantity}</TableCell>
                  <TableCell>
                    {assignment.item?.category?.name || "Uncategorized"}
                  </TableCell>
                  {status !== "delivered" && (
                    <TableCell>{getNextActionButton(assignment)}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
