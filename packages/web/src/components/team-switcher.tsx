import { Building2, Plus } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useGroupStore } from "@/lib/group-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function GroupSwitcher() {
  const { groups, currentGroup, setCurrentGroup } = useGroupStore();

  // When no groups exist, show a create group button
  if (!currentGroup && groups.length === 0) {
    return (
      <div className="p-4">
        <Button
          asChild
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <Link to="/groups">
            <Plus className="h-4 w-4" />
            Create Group
          </Link>
        </Button>
      </div>
    );
  }

  if (!currentGroup) {
    return null;
  }

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
              {currentGroup.name}
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
                    currentGroup.id === group.id && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    <span>{group.name}</span>
                  </div>
                </button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 mt-2"
                asChild
              >
                <Link to="/create-group">
                  <Plus className="h-4 w-4" />
                  Create New Group
                </Link>
              </Button>
            </div>
          </ScrollArea>
        </SidebarContent>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
