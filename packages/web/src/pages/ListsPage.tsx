import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get, post, put, del } from "@/services/HttpHelper";
import {
  PlusCircle,
  MoreVertical,
  Archive,
  Trash,
  Edit,
  ClipboardList,
} from "lucide-react";

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
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

export default function ListsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState<List[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newList, setNewList] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, [groupId, showArchived]);

  const fetchData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Fetch the group details
      const groupResponse = await get<ApiResponse<Group>>(`/groups/${groupId}`);
      if (groupResponse.error) {
        setError(groupResponse.error);
        return;
      }
      setGroup(groupResponse.data?.data || null);

      // Fetch the lists for this group
      const listsResponse = await get<ApiResponse<List[]>>(
        `/lists/group/${groupId}?includeArchived=${showArchived}`
      );
      if (listsResponse.error) {
        setError(listsResponse.error);
        return;
      }
      setLists(listsResponse.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async () => {
    try {
      const response = await post<ApiResponse<List>>("/lists", {
        ...newList,
        groupId,
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      setNewList({ name: "", description: "" });
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error creating list:", error);
      setError("Failed to create list. Please try again.");
    }
  };

  const handleArchiveList = async (listId: string) => {
    try {
      const response = await put<ApiResponse<List>>(
        `/lists/${listId}/archive`,
        {}
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error archiving list:", error);
      setError("Failed to archive list. Please try again.");
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      const response = await del<ApiResponse<void>>(`/lists/${listId}`);

      if (response.error) {
        setError(response.error);
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error deleting list:", error);
      setError("Failed to delete list. Please try again.");
    }
  };

  const navigateToList = (listId: string) => {
    navigate(`/lists/${listId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4">
          <div className="h-12 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-32 w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 w-full bg-gray-200 animate-pulse rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Group not found"}</AlertDescription>
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
          <h1 className="text-3xl font-bold">{group.name}: Lists</h1>
          <p className="text-gray-500 mt-1">{group.description}</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New List
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showArchived"
            checked={showArchived}
            onCheckedChange={(checked: boolean) => setShowArchived(!!checked)}
          />
          <Label htmlFor="showArchived">Show archived lists</Label>
        </div>
      </div>

      {lists.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="flex justify-center">
              <ClipboardList className="h-12 w-12 mb-2" />
            </CardTitle>
            <CardDescription className="text-xl">
              No Lists Found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {showArchived
                ? "There are no lists in this group, including archived ones."
                : "There are no active lists in this group."}
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="mx-auto"
            >
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Card
              key={list.id}
              className={`relative ${
                list.isArchived ? "opacity-75 bg-gray-50" : ""
              }`}
            >
              {list.isArchived && (
                <div className="absolute top-0 right-0 bg-gray-500 text-white text-xs px-2 py-1 rounded-bl">
                  Archived
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle
                    className="cursor-pointer"
                    onClick={() => navigateToList(list.id)}
                  >
                    {list.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigateToList(list.id)}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        View Items
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit List
                      </DropdownMenuItem>
                      {!list.isArchived && (
                        <DropdownMenuItem
                          onClick={() => handleArchiveList(list.id)}
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive List
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteList(list.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete List
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{list.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Created {new Date(list.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigateToList(list.id)}
                >
                  View Items
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new list for {group.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newList.name}
                onChange={(e) =>
                  setNewList({ ...newList, name: e.target.value })
                }
                placeholder="List name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newList.description}
                onChange={(e) =>
                  setNewList({ ...newList, description: e.target.value })
                }
                placeholder="List description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateList} disabled={!newList.name}>
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
