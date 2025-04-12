import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";
import {
  getMembers,
  updateMemberRole,
  removeMember,
} from "@/services/MemberService";
import { get } from "@/services/HttpHelper";
import { Member, UpdateMemberRoleRequest } from "@/services/MemberService";
import { ApiResponse } from "@/services/types";

interface Group {
  id: string;
  name: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [groups, setGroups] = useState<Group[]>([]);
  const [memberToChangeRole, setMemberToChangeRole] = useState<Member | null>(
    null
  );
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "member" | "viewer">(
    "member"
  );
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch members data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);

        const response = await getMembers(
          selectedGroup !== "all" && selectedGroup ? selectedGroup : undefined
        );

        if (response.error) {
          setError(response.error);
        } else if (response.data?.success) {
          setMembers(response.data.data || []);
          setFilteredMembers(response.data.data || []);
        } else {
          setError("Failed to fetch members");
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to fetch members. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await get<ApiResponse<Group[]>>("/groups");

        if (!response.error && response.data?.success) {
          setGroups(response.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };

    fetchMembers();
    fetchGroups();
  }, [selectedGroup]);

  // Filter members based on search query and role
  useEffect(() => {
    let result = [...members];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      );
    }

    if (selectedRole && selectedRole !== "all") {
      result = result.filter((member) => member.role === selectedRole);
    }

    setFilteredMembers(result);
  }, [members, searchQuery, selectedRole]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!memberToChangeRole || !newRole) return;

    try {
      setIsProcessing(true);

      const request: UpdateMemberRoleRequest = { role: newRole };
      const response = await updateMemberRole(memberToChangeRole.id, request);

      if (response.error) {
        toast.error("Error", {
          description: response.error,
        });
      } else if (response.data?.success) {
        // Update the member in the list
        const updatedMembers = members.map((member) =>
          member.id === memberToChangeRole.id
            ? { ...member, role: newRole }
            : member
        );

        setMembers(updatedMembers);

        toast.success("Role updated", {
          description: `${memberToChangeRole.name}'s role updated to ${newRole}`,
        });
      } else {
        toast.error("Error", {
          description: "Failed to update member role",
        });
      }
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsProcessing(false);
      setIsRoleDialogOpen(false);
      setMemberToChangeRole(null);
    }
  };

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setIsProcessing(true);

      const response = await removeMember(memberToRemove.id);

      if (response.error) {
        toast.error("Error", {
          description: response.error,
        });
      } else if (response.data?.success) {
        // Remove the member from the list
        const updatedMembers = members.filter(
          (member) => member.id !== memberToRemove.id
        );
        setMembers(updatedMembers);

        toast.success("Member removed", {
          description: `${memberToRemove.name} has been removed`,
        });
      } else {
        toast.error("Error", {
          description: "Failed to remove member",
        });
      }
    } catch (err) {
      console.error("Error removing member:", err);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsProcessing(false);
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
    }
  };

  // Open role change dialog
  const openRoleDialog = (member: Member) => {
    setMemberToChangeRole(member);
    // Only set role if it's not 'owner' since owner isn't a valid option for the dropdown
    if (member.role !== "owner") {
      setNewRole(member.role as "admin" | "member" | "viewer");
    } else {
      setNewRole("admin"); // Default to admin if current role is owner
    }
    setIsRoleDialogOpen(true);
  };

  // Open remove member dialog
  const openRemoveDialog = (member: Member) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  // Get role icon based on role
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case "admin":
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case "member":
        return <Shield className="h-4 w-4 text-green-500" />;
      case "viewer":
        return <ShieldQuestion className="h-4 w-4 text-gray-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  // Get role badge based on role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            {role}
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            {role}
          </Badge>
        );
      case "member":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            {role}
          </Badge>
        );
      case "viewer":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            {role}
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-semibold">
            Total Members: {filteredMembers.length}
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Filters and search */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>
              Filter and search for specific team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {groups.length > 0 && (
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All groups</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Members list */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button size="sm" className="h-8">
                <UserPlus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            </div>
            <CardDescription>
              Manage your team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex justify-center items-center p-8 text-red-500">
                {error}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex justify-center items-center p-8 text-muted-foreground">
                No members found
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)] rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      {!selectedGroup && <TableHead>Group</TableHead>}
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={`https://avatar.vercel.sh/${member.email}`}
                              />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            {getRoleBadge(member.role)}
                          </div>
                        </TableCell>
                        {!selectedGroup && (
                          <TableCell>
                            {member.groupName || "Unknown Group"}
                          </TableCell>
                        )}
                        <TableCell>
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => openRoleDialog(member)}
                                disabled={member.role === "owner"}
                              >
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openRemoveDialog(member)}
                                disabled={member.role === "owner"}
                                className="text-red-600"
                              >
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {memberToChangeRole?.name}
            </DialogDescription>
          </DialogHeader>
          <Select
            value={newRole}
            onValueChange={setNewRole as (value: string) => void}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={!newRole || isProcessing}
            >
              {isProcessing ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from the
              group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
