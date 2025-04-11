import * as React from "react";
import {
  Settings2,
  Users,
  Building2,
  PackageSearch,
  Truck,
  BarChart3,
  ClipboardList,
  ShoppingCart,
  Warehouse,
  UserCog,
  ScrollText,
  Bell,
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

// Navigation items for different roles
const roleBasedNavigation = {
  owner: {
    teams: [
      {
        name: "Your Organization",
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
            title: "Analytics",
            url: "/dashboard/analytics",
          },
          {
            title: "Reports",
            url: "/dashboard/reports",
          },
        ],
      },
      {
        title: "Organization",
        url: "/organization",
        icon: Users,
        items: [
          {
            title: "Team Members",
            url: "/organization/members",
          },
          {
            title: "Roles & Permissions",
            url: "/organization/roles",
          },
          {
            title: "Billing",
            url: "/organization/billing",
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
            title: "Security",
            url: "/settings/security",
          },
          {
            title: "API Keys",
            url: "/settings/api-keys",
          },
        ],
      },
    ],
  },
  admin: {
    teams: [
      {
        name: "Admin Panel",
        logo: UserCog,
      },
    ],
    navMain: [
      {
        title: "Inventory",
        url: "/inventory",
        icon: Warehouse,
        isActive: true,
        items: [
          {
            title: "Products",
            url: "/inventory/products",
          },
          {
            title: "Categories",
            url: "/inventory/categories",
          },
          {
            title: "Stock Management",
            url: "/inventory/stock",
          },
        ],
      },
      {
        title: "Orders",
        url: "/orders",
        icon: ShoppingCart,
        items: [
          {
            title: "All Orders",
            url: "/orders/all",
          },
          {
            title: "Pending",
            url: "/orders/pending",
          },
          {
            title: "Fulfilled",
            url: "/orders/fulfilled",
          },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "/settings/general",
          },
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
        name: "Team Space",
        logo: Users,
      },
    ],
    navMain: [
      {
        title: "Orders",
        url: "/orders",
        icon: ClipboardList,
        isActive: true,
        items: [
          {
            title: "My Orders",
            url: "/orders/my",
          },
          {
            title: "Track Order",
            url: "/orders/track",
          },
        ],
      },
      {
        title: "Products",
        url: "/products",
        icon: PackageSearch,
        items: [
          {
            title: "Browse",
            url: "/products/browse",
          },
          {
            title: "Saved Items",
            url: "/products/saved",
          },
        ],
      },
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        items: [
          {
            title: "All",
            url: "/notifications/all",
          },
          {
            title: "Settings",
            url: "/notifications/settings",
          },
        ],
      },
    ],
  },
  viewer: {
    teams: [
      {
        name: "View Only",
        logo: ScrollText,
      },
    ],
    navMain: [
      {
        title: "Products",
        url: "/products",
        icon: PackageSearch,
        isActive: true,
        items: [
          {
            title: "Browse",
            url: "/products/browse",
          },
          {
            title: "Categories",
            url: "/products/categories",
          },
        ],
      },
      {
        title: "Track Orders",
        url: "/track",
        icon: Truck,
        items: [
          {
            title: "Search Order",
            url: "/track/search",
          },
          {
            title: "Recent",
            url: "/track/recent",
          },
        ],
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
