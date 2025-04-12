import { Building2, Plus } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useGroupStore, type Group } from "@/lib/group-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { get } from "@/services/HttpHelper";
import { useAuth } from "@/hooks/use-auth";

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

interface GroupMember {
  userId: string;
  groupId: string;
  role: "owner" | "admin" | "member" | "viewer";
}

export function GroupSwitcher() {
  const { user } = useAuth();
  const { groups, currentGroup, setCurrentGroup, setGroups, setGroupRole } =
    useGroupStore();

  const fetchUserRole = async (groupId: string) => {
    try {
      const response = await get<ApiResponse<GroupMember[]>>(
        `/groups/${groupId}/members`
      );
      if (response.data?.data) {
        const userMembership = response.data.data.find(
          (member) => member.userId === user?.id
        );
        if (userMembership) {
          setGroupRole(userMembership.role);
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await get<ApiResponse<Group[]>>("/groups");
        if (response.data?.data) {
          setGroups(response.data.data);
          // Set first group as current if none selected
          if (!currentGroup && response.data.data.length > 0) {
            const firstGroup = response.data.data[0];
            setCurrentGroup(firstGroup);
            await fetchUserRole(firstGroup.id);
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupChange = async (group: Group) => {
    setCurrentGroup(group);
    await fetchUserRole(group.id);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent bg-primary text-primary-foreground data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-lg">
              {currentGroup?.name || "Select Group"}
            </span>
          </div>
        </SidebarMenuButton>
        <SidebarContent>
          <ScrollArea className="max-h-[200px]">
            <div className="p-1 space-y-0.5">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupChange(group)}
                  className={cn(
                    "w-full rounded-md py-1.5 px-2 text-left text-sm transition-colors hover:bg-accent",
                    currentGroup?.id === group.id && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    <span>{group.name}</span>
                  </div>
                </button>
              ))}
              <Link
                to="/groups"
                className="flex w-full items-center gap-2 rounded-md py-1.5 px-2 text-sm transition-colors hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                Create New Group
              </Link>
            </div>
          </ScrollArea>
        </SidebarContent>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
