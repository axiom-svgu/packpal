import * as React from "react";
import {
  Settings2,
  Users,
  Building2,
  BarChart3,
  ClipboardList,
  UserCog,
  ScrollText,
  Bell,
  Gauge,
  CalendarRange,
  ClipboardCheck,
  GaugeCircle,
  Package,
  UserPlus,
  Layers,
  User,
  Plus,
  ChevronDown,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { useGroupStore } from "@/lib/group-store";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link } from "react-router-dom";

const roleBasedNavigation = {
  owner: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Packing Lists",
      url: "/packing-lists",
      icon: ClipboardList,
    },
    {
      title: "Assign Items",
      url: "/assign-items",
      icon: Package,
    },
    {
      title: "Manage Roles",
      url: "/manage-roles",
      icon: UserCog,
    },
    {
      title: "Create Event/Trip",
      url: "/create-event",
      icon: CalendarRange,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],

  admin: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Packing Lists",
      url: "/packing-lists",
      icon: ClipboardList,
    },
    {
      title: "Assign Items",
      url: "/assign-items",
      icon: Package,
    },
    {
      title: "Manage Categories",
      url: "/manage-categories",
      icon: Layers,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],

  member: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Packing Lists",
      url: "/packing-lists",
      icon: ClipboardList,
    },
    {
      title: "My Items",
      url: "/my-items",
      icon: Package,
    },
    {
      title: "Suggest Items",
      url: "/suggest-items",
      icon: UserPlus,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],

  viewer: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Packing Lists",
      url: "/packing-lists",
      icon: ClipboardList,
    },
    {
      title: "Group Progress",
      url: "/group-progress",
      icon: GaugeCircle,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { currentGroup, groupRole, groups, setCurrentGroup } = useGroupStore();

  const navigationItems = groupRole ? roleBasedNavigation[groupRole] : [];

  if (!user) {
    return null;
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                {currentGroup?.name || "Select Group"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => setCurrentGroup(group)}
                >
                  {group.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link to="/create-group" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Group
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email }} />
      </SidebarFooter>
      {!isMobile && <SidebarRail />}
    </Sidebar>
  );
}
