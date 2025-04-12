import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { get, post, put, del } from "@/services/HttpHelper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, Crown, LogOut, UserPlus } from "lucide-react";

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

interface GroupMember {
  id: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [newOwnerId, setNewOwnerId] = useState<string>("");
  const [newMember, setNewMember] = useState({
    email: "",
    role: "member" as const,
  });

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setError(null);
    try {
      const [groupResponse, membersResponse] = await Promise.all([
        get<ApiResponse<Group>>(`/groups/${groupId}`),
        get<ApiResponse<GroupMember[]>>(`/groups/${groupId}/members`),
      ]);

      if (groupResponse.error) {
        setError(groupResponse.error);
        setGroup(null);
        return;
      }

      if (membersResponse.error) {
        setError(membersResponse.error);
        setMembers([]);
        return;
      }

      if (groupResponse.data && membersResponse.data) {
        setGroup(groupResponse.data.data);
        setMembers(membersResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
      setError("Failed to load group details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email) {
      setError("Email is required");
      return;
    }

    try {
      const response = await post<ApiResponse<void>>(
        `/groups/${groupId}/invite`,
        newMember
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      setNewMember({ email: "", role: "member" });
      setIsInviteDialogOpen(false);
      setError(null);
      fetchGroupDetails();
    } catch (error) {
      console.error("Error adding member:", error);
      setError("Failed to add member. Please try again.");
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const response = await put<ApiResponse<void>>(
        `/groups/${groupId}/members/${userId}/role`,
        {
          role,
        }
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      setError(null);
      fetchGroupDetails();
    } catch (error) {
      console.error("Error updating role:", error);
      setError("Failed to update role. Please try again.");
    }
  };

  const confirmRemoveMember = (userId: string) => {
    setMemberToRemove(userId);
    setIsRemoveDialogOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const response = await del<ApiResponse<void>>(
        `/groups/${groupId}/members/${memberToRemove}`
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      setError(null);
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
      fetchGroupDetails();
    } catch (error) {
      console.error("Error removing member:", error);
      setError("Failed to remove member. Please try again.");
    }
  };

  const handleLeaveGroup = async () => {
    try {
      const response = await del<ApiResponse<void>>(`/groups/${groupId}/leave`);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Redirect to groups page after leaving
      window.location.href = "/groups";
    } catch (error) {
      console.error("Error leaving group:", error);
      setError("Failed to leave the group. Please try again.");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await del<ApiResponse<void>>(`/groups/${groupId}`);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Redirect to groups page after deletion
      window.location.href = "/groups";
    } catch (error) {
      console.error("Error deleting group:", error);
      setError("Failed to delete the group. Please try again.");
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerId) {
      setError("Please select a new owner");
      return;
    }

    try {
      const response = await put<ApiResponse<void>>(
        `/groups/${groupId}/transfer-ownership/${newOwnerId}`,
        {}
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      setError(null);
      setIsTransferDialogOpen(false);
      fetchGroupDetails();
    } catch (error) {
      console.error("Error transferring ownership:", error);
      setError("Failed to transfer ownership. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-4">
          <div className="h-12 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-32 w-full bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-gray-200 animate-pulse rounded"
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

  const userMembership = members.find((m) => m.userId === user?.id);
  const canManageMembers =
    userMembership?.role === "owner" || userMembership?.role === "admin";
  const isOwner = userMembership?.role === "owner";
  const possibleNewOwners = members.filter(
    (m) => m.userId !== user?.id && (m.role === "admin" || m.role === "member")
  );

  return (
    <div className="container mx-auto py-8">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTransferDialogOpen(true)}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Transfer Ownership
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </p>
            {userMembership && userMembership.role !== "owner" && (
              <Button
                variant="outline"
                onClick={() => setIsLeaveDialogOpen(true)}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Group
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Members</h2>
        {canManageMembers && (
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>
                  Add a new member to the group.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    placeholder="Member's email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value) =>
                      setNewMember({ ...newMember, role: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMember} disabled={!newMember.email}>
                    Add Member
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {canManageMembers && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canManageMembers ? 4 : 3}
                    className="text-center py-6"
                  >
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.user.name}</TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>
                      {canManageMembers && member.role !== "owner" ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleUpdateRole(member.userId, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center">
                          {member.role}
                          {member.role === "owner" && (
                            <Crown className="h-4 w-4 ml-2 text-amber-500" />
                          )}
                        </div>
                      )}
                    </TableCell>
                    {canManageMembers && member.role !== "owner" && (
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmRemoveMember(member.userId)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the
              member from this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this group?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this group? You will need to be
              invited again to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup}>
              Leave Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              group and remove all members from it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogDescription>
              Transfer group ownership to another member. You will be demoted to
              an admin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {possibleNewOwners.length === 0 ? (
              <p className="text-amber-600">
                There are no other members who can become owners. Add more
                members first.
              </p>
            ) : (
              <Select value={newOwnerId} onValueChange={setNewOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new owner" />
                </SelectTrigger>
                <SelectContent>
                  {possibleNewOwners.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user.name} ({member.user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleTransferOwnership}
              disabled={!newOwnerId || possibleNewOwners.length === 0}
            >
              Transfer Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
