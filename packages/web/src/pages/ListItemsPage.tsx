import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { get, post, put, del } from "@/services/HttpHelper";
import {
  PlusCircle,
  MoreVertical,
  Trash,
  Edit,
  User,
  ChevronLeft,
  CheckSquare,
  Square,
  UserPlus,
  UserMinus,
} from "lucide-react";

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

interface List {
  id: string;
  name: string;
  description: string;
  groupId: string;
  createdBy: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListItem {
  id: string;
  name: string;
  description: string;
  isCompleted: boolean;
  listId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedUsers?: AssignedUser[];
}

interface AssignedUser {
  id: string;
  name: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
}

interface GroupMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export default function ListItemsPage() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState<List | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, [listId]);

  const fetchData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Fetch the list details
      const listResponse = await get<ApiResponse<List>>(`/lists/${listId}`);
      if (listResponse.error) {
        setError(listResponse.error);
        return;
      }
      setList(listResponse.data?.data || null);

      if (listResponse.data?.data?.groupId) {
        // Fetch the group details
        const groupResponse = await get<ApiResponse<Group>>(
          `/groups/${listResponse.data.data.groupId}`
        );
        if (groupResponse.error) {
          setError(groupResponse.error);
        } else {
          setGroup(groupResponse.data?.data || null);
        }

        // Fetch group members
        const membersResponse = await get<ApiResponse<GroupMember[]>>(
          `/groups/${listResponse.data.data.groupId}/members`
        );
        if (membersResponse.error) {
          setError(membersResponse.error);
        } else {
          setGroupMembers(membersResponse.data?.data || []);
        }
      }

      // Fetch the list items
      const itemsResponse = await get<ApiResponse<ListItem[]>>(
        `/lists/${listId}/items`
      );
      if (itemsResponse.error) {
        setError(itemsResponse.error);
        return;
      }
      setItems(itemsResponse.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      const response = await post<ApiResponse<ListItem>>(
        `/lists/${listId}/items`,
        {
          ...newItem,
        }
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      setNewItem({ name: "", description: "" });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating item:", error);
      setError("Failed to create item. Please try again.");
    }
  };

  const handleToggleComplete = async (
    itemId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await put<ApiResponse<ListItem>>(
        `/lists/items/${itemId}`,
        {
          isCompleted: !currentStatus,
        }
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error updating item:", error);
      setError("Failed to update item. Please try again.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await del<ApiResponse<void>>(`/lists/items/${itemId}`);

      if (response.error) {
        setError(response.error);
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item. Please try again.");
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedItemId) return;

    try {
      const response = await post<ApiResponse<void>>(
        `/lists/items/${selectedItemId}/assign/${userId}`,
        {}
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      setIsAssignDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error assigning user:", error);
      setError("Failed to assign user. Please try again.");
    }
  };

  const handleUnassignUser = async (itemId: string, userId: string) => {
    try {
      const response = await del<ApiResponse<void>>(
        `/lists/items/${itemId}/assign/${userId}`
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error unassigning user:", error);
      setError("Failed to unassign user. Please try again.");
    }
  };

  const openAssignDialog = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsAssignDialogOpen(true);
  };

  const navigateBackToLists = () => {
    if (group) {
      navigate(`/groups/${group.id}/lists`);
    } else {
      navigate("/groups");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4">
          <div className="h-12 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-32 w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="mt-4">
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-gray-200 animate-pulse rounded mb-2"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "List not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <a href="/groups">Back to Groups</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button
            variant="ghost"
            onClick={navigateBackToLists}
            className="mb-2"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Lists
          </Button>
          <h1 className="text-3xl font-bold">{list.name}</h1>
          <p className="text-gray-500 mt-1">{list.description}</p>
          {group && (
            <p className="text-sm text-gray-400 mt-1">Group: {group.name}</p>
          )}
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {items.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="flex justify-center">
              <CheckSquare className="h-12 w-12 mb-2" />
            </CardTitle>
            <CardDescription className="text-xl">
              No Items Found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">This list has no items yet.</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="mx-auto"
            >
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>List Items</CardTitle>
            <CardDescription>
              Manage items in your list. Check off completed items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Assigned To</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={item.isCompleted ? "bg-gray-50" : ""}
                  >
                    <TableCell>
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          handleToggleComplete(item.id, item.isCompleted)
                        }
                      >
                        {item.isCompleted ? (
                          <CheckSquare className="h-5 w-5 text-green-500" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`font-medium ${
                        item.isCompleted ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell
                      className={item.isCompleted ? "text-gray-500" : ""}
                    >
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.assignedUsers && item.assignedUsers.length > 0 ? (
                          item.assignedUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center mr-2"
                            >
                              <Avatar className="h-6 w-6 mr-1">
                                <AvatarFallback>
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{user.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1"
                                onClick={() =>
                                  handleUnassignUser(item.id, user.id)
                                }
                              >
                                <UserMinus className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Unassigned
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openAssignDialog(item.id)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openAssignDialog(item.id)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new item to {list.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="itemName">Name</Label>
              <Input
                id="itemName"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Item name"
              />
            </div>
            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                placeholder="Item description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateItem} disabled={!newItem.name}>
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
            <DialogDescription>
              Assign a group member to this item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {groupMembers.length === 0 ? (
              <p>No group members available.</p>
            ) : (
              <div className="space-y-2">
                {groupMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAssignUser(member.userId)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
