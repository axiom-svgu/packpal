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
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          },
          {
            title: "Progress",
            url: "/dashboard/progress",
          },
          {
            title: "Reports",
            url: "/dashboard/reports",
          },
        ],
      },
      {
        title: "Events",
        url: "/events",
        icon: CalendarRange,
        items: [
          {
            title: "All Events",
            url: "/events",
          },
          {
            title: "Create Event",
            url: "/events/create",
          },
        ],
      },
      {
        title: "Checklist",
        url: "/checklist",
        icon: ClipboardList,
        items: [
          {
            title: "Categories",
            url: "/checklist/categories",
          },
          {
            title: "Items",
            url: "/checklist/items",
          },
          {
            title: "Assignments",
            url: "/checklist/assignments",
          },
        ],
      },
      {
        title: "Team",
        url: "/team",
        icon: Users,
        items: [
          {
            title: "Members",
            url: "/team/members",
          },
          {
            title: "Roles & Permissions",
            url: "/team/roles",
          },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
          {
            title: "Organization",
            url: "/settings/organization",
          },
          {
            title: "Notifications",
            url: "/settings/notifications",
          },
        ],
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
        title: "Checklist",
        url: "/checklist",
        icon: ClipboardList,
        isActive: true,
        items: [
          {
            title: "Categories",
            url: "/checklist/categories",
          },
          {
            title: "Items",
            url: "/checklist/items",
          },
          {
            title: "Assignments",
            url: "/checklist/assignments",
          },
        ],
      },
      {
        title: "Team",
        url: "/team",
        icon: Users,
        items: [
          {
            title: "Members",
            url: "/team/members",
          },
        ],
      },
      {
        title: "Progress",
        url: "/dashboard/progress",
        icon: GaugeCircle,
        items: [],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
          {
            title: "Notifications",
            url: "/settings/notifications",
          },
        ],
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
        title: "My Checklist",
        url: "/my-checklist",
        icon: ClipboardCheck,
        isActive: true,
        items: [
          {
            title: "Assigned Items",
            url: "/my-checklist/items",
          },
          {
            title: "Update Status",
            url: "/my-checklist/status",
          },
        ],
      },
      {
        title: "Progress",
        url: "/progress",
        icon: Gauge,
        items: [],
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        items: [],
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
        title: "Checklist",
        url: "/checklist",
        icon: ClipboardList,
        isActive: true,
        items: [
          {
            title: "View Categories",
            url: "/checklist/categories",
          },
          {
            title: "View Items",
            url: "/checklist/items",
          },
        ],
      },
      {
        title: "Progress",
        url: "/progress",
        icon: Gauge,
        items: [],
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
