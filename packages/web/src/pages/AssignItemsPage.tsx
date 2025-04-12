import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGroupStore } from "@/lib/group-store";
import { get } from "@/services/HttpHelper";
import { fetchItemsByGroup } from "@/services/ItemService";
import { createAssignment } from "@/services/ItemAssignmentService";
import { Item, User } from "@/services/types";

export default function AssignItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { currentGroup } = useGroupStore();

  useEffect(() => {
    if (currentGroup) {
      fetchItems(currentGroup.id);
      fetchGroupMembers(currentGroup.id);
    }
  }, [currentGroup]);

  const fetchItems = async (groupId: string) => {
    setLoading(true);
    try {
      const data = await fetchItemsByGroup(groupId);
      // Filter out items that are already assigned
      const unassignedItems = data.filter(
        (item) => !item.assignments || item.assignments.length === 0
      );
      setItems(unassignedItems);
      setError(null);
    } catch (err) {
      setError("Failed to fetch items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await get<{ data: { user: User }[] }>(
        `/groups/${groupId}/members`
      );
      if (response.error) {
        setError("Failed to fetch group members");
        return;
      }

      const members = response.data?.data.map((member) => member.user) || [];
      setGroupMembers(members);
    } catch (err) {
      setError("Failed to fetch group members");
      console.error(err);
    }
  };

  const handleAssignItem = async () => {
    if (!currentItem || !selectedUserId) return;

    try {
      await createAssignment({
        itemId: currentItem.id,
        assignedTo: selectedUserId,
        status: "to_pack",
      });

      // Refresh items list to remove the assigned item
      if (currentGroup) {
        fetchItems(currentGroup.id);
      }

      setIsAssignDialogOpen(false);
      setCurrentItem(null);
      setSelectedUserId("");
    } catch (err) {
      setError("Failed to assign item");
      console.error(err);
    }
  };

  const openAssignDialog = (item: Item) => {
    setCurrentItem(item);
    setIsAssignDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assign Items</h2>
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-semibold">
            Unassigned Items: {items.length}
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
          <CardTitle>Item Assignment</CardTitle>
          <CardDescription>
            Assign items to team members for packing and handling.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <p>Loading items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No unassigned items</p>
              <p className="text-sm text-muted-foreground mt-1">
                All items have been assigned to team members.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.category?.name || "Uncategorized"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openAssignDialog(item)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Item Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Item</DialogTitle>
            <DialogDescription>
              Select a team member to assign this item to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="font-medium mb-2">Item: {currentItem?.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Quantity: {currentItem?.quantity}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Assign to:</label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignItem} disabled={!selectedUserId}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
