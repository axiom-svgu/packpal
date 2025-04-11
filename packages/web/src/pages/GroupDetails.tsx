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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { get, post, put, del } from "@/services/HttpHelper";

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

export default function GroupDetails() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMember, setNewMember] = useState({
    email: "",
    role: "member" as const,
  });

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const [groupResponse, membersResponse] = await Promise.all([
        get<ApiResponse<Group>>(`/groups/${groupId}`),
        get<ApiResponse<GroupMember[]>>(`/groups/${groupId}/members`),
      ]);

      if (groupResponse.data && membersResponse.data) {
        setGroup(groupResponse.data.data);
        setMembers(membersResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await post<ApiResponse<void>>(`/groups/${groupId}/members`, newMember);
      setNewMember({ email: "", role: "member" });
      fetchGroupDetails();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await put<ApiResponse<void>>(`/groups/${groupId}/members/${userId}`, {
        role,
      });
      fetchGroupDetails();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await del<ApiResponse<void>>(`/groups/${groupId}/members/${userId}`);
      fetchGroupDetails();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const userMembership = members.find((m) => m.userId === user?.id);
  const canManageMembers =
    userMembership?.role === "owner" || userMembership?.role === "admin";

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{group.name}</CardTitle>
          <CardDescription>{group.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Members</h2>
        {canManageMembers && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Member</Button>
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
                <Button onClick={handleAddMember}>Add Member</Button>
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
              {members.map((member) => (
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
                      member.role
                    )}
                  </TableCell>
                  {canManageMembers && member.role !== "owner" && (
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
