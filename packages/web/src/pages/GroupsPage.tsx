import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { get, post } from "@/services/HttpHelper";
import { UserPlus, Users, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = groups.filter(
        (group) =>
          group.name.toLowerCase().includes(lowercaseQuery) ||
          (group.description &&
            group.description.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  const fetchGroups = async () => {
    setError(null);
    try {
      const response = await get<{ data: Group[] }>("/groups");
      if (response.data && response.data.data) {
        const fetchedGroups = response.data.data;
        setGroups(fetchedGroups);
        setFilteredGroups(fetchedGroups);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await post("/groups", newGroup);
      if (response.error) {
        setError(response.error);
        return;
      }
      setNewGroup({ name: "", description: "" });
      setIsDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Failed to create group. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 animate-pulse rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold">Groups</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="pl-8"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group and become its owner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    placeholder="Group name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    value={newGroup.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                    placeholder="Group description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateGroup} disabled={!newGroup.name}>
                  Create Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredGroups.length === 0 && !error ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="flex justify-center">
              <Users className="h-12 w-12 mb-2" />
            </CardTitle>
            <CardDescription className="text-xl">
              {searchQuery ? "No matching groups found" : "No Groups Found"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchQuery ? (
              <p className="mb-4">
                Try using different search terms or clear your search.
              </p>
            ) : (
              <>
                <p className="mb-4">You don't belong to any groups yet.</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="mx-auto"
                >
                  Create Your First Group
                </Button>
              </>
            )}
          </CardContent>
          {searchQuery && (
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </CardFooter>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-gray-500">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/groups/${group.id}`}>View Details</a>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <a href={`/groups/${group.id}`}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
