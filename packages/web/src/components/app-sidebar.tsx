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
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";

const roleBasedNavigation = {
  owner: {
    teams: [
      {
        name: "Your Events",
        logo: Building2,
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
        isActive: true,
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
  },

  admin: {
    teams: [
      {
        name: "Admin Tools",
        logo: UserCog,
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
        isActive: true,
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
  },

  member: {
    teams: [
      {
        name: "My Events",
        logo: Users,
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
        isActive: true,
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
  },

  viewer: {
    teams: [
      {
        name: "Read-Only Access",
        logo: ScrollText,
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
        isActive: true,
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
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Get navigation items based on user role
  const roleNav =
    roleBasedNavigation[user.role as keyof typeof roleBasedNavigation] ||
    roleBasedNavigation.viewer;

  return (
    <Sidebar
      variant="inset"
      collapsible={isMobile ? "offcanvas" : "icon"}
      className="md:block border-r border-border"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={roleNav.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={roleNav.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
