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

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export function GroupSwitcher() {
  const { groups, currentGroup, setCurrentGroup, setGroups } = useGroupStore();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await get<ApiResponse<Group[]>>("/groups");
        if (response.data?.data) {
          setGroups(response.data.data);
          // Set first group as current if none selected
          if (!currentGroup && response.data.data.length > 0) {
            setCurrentGroup(response.data.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

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
          <ScrollArea className="h-[300px]">
            <div className="p-2 space-y-1">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setCurrentGroup(group)}
                  className={cn(
                    "w-full rounded-md p-2 text-left text-sm transition-colors hover:bg-accent",
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
                to="/create-group"
                className="flex w-full items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-accent"
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
