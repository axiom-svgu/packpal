import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, CheckCircle, AlertCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  fetchAssignmentsByUser,
  updateAssignmentStatus,
} from "@/services/ItemAssignmentService";
import { ItemAssignment, ItemStatus } from "@/services/types";
import { useAuth } from "@/hooks/use-auth";

export default function MyItemsPage() {
  const [assignments, setAssignments] = useState<ItemAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await fetchAssignmentsByUser(user.id);
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch your assigned items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    assignmentId: string,
    status: ItemStatus
  ) => {
    try {
      await updateAssignmentStatus(assignmentId, { status });
      fetchAssignments(); // Refresh the data
    } catch (err) {
      setError("Failed to update item status");
      console.error(err);
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case "to_pack":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            To Pack
          </Badge>
        );
      case "packed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Packed
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Delivered
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getNextStatusAction = (assignment: ItemAssignment) => {
    switch (assignment.status) {
      case "to_pack":
        return (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus(assignment.id, "packed")}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Packed
          </Button>
        );
      case "packed":
        return (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus(assignment.id, "delivered")}
            className="bg-green-500 hover:bg-green-600"
          >
            <Truck className="mr-2 h-4 w-4" />
            Mark Delivered
          </Button>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Items</h2>
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">
            My Items: {assignments.length}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assigned Items</CardTitle>
          <CardDescription>
            View and manage items assigned to you for packing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <p>Loading your items...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">
                No items assigned to you
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Items will appear here when they are assigned to you.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
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
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>{getNextStatusAction(assignment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
