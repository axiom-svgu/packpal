import * as React from "react";
import {
  Settings2,
  BarChart3,
  ClipboardList,
  UserCog,
  Bell,
  CalendarRange,
  GaugeCircle,
  Package,
  UserPlus,
  Layers,
  User,
  Users,
  Box,
  CheckCircle,
  Truck,
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
import { GroupSwitcher } from "@/components/team-switcher";

const roleBasedNavigation = {
  owner: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Members",
      url: "/members",
      icon: Users,
    },
    {
      title: "To Pack",
      url: "/to-pack",
      icon: Box,
    },
    {
      title: "Packed",
      url: "/packed",
      icon: CheckCircle,
    },
    {
      title: "Delivered",
      url: "/delivered",
      icon: Truck,
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
      title: "Members",
      url: "/members",
      icon: Users,
    },
    {
      title: "To Pack",
      url: "/to-pack",
      icon: Box,
    },
    {
      title: "Packed",
      url: "/packed",
      icon: CheckCircle,
    },
    {
      title: "Delivered",
      url: "/delivered",
      icon: Truck,
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
      title: "Members",
      url: "/members",
      icon: Users,
    },
    {
      title: "To Pack",
      url: "/to-pack",
      icon: Box,
    },
    {
      title: "Packed",
      url: "/packed",
      icon: CheckCircle,
    },
    {
      title: "Delivered",
      url: "/delivered",
      icon: Truck,
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
      title: "Members",
      url: "/members",
      icon: Users,
    },
    {
      title: "To Pack",
      url: "/to-pack",
      icon: Box,
    },
    {
      title: "Packed",
      url: "/packed",
      icon: CheckCircle,
    },
    {
      title: "Delivered",
      url: "/delivered",
      icon: Truck,
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
  const { groupRole } = useGroupStore();

  console.log(groupRole);

  const navigationItems = groupRole ? roleBasedNavigation[groupRole] : [];

  if (!user) {
    return null;
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <GroupSwitcher />
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
