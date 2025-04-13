"use client";

import { LogOut, User } from "lucide-react";

import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth"; // Assuming useAuth is the hook for authentication

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const { updateUser } = useAuth(); // Get the logout function from auth store

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-200">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <LogOut
              className="ml-auto size-4"
              onClick={() => {
                updateUser({
                  name: "",
                  email: "",
                });

                localStorage.removeItem("token");

                window.location.href = "/signin";
              }}
            />{" "}
            {/* Log out icon with click handler */}
          </SidebarMenuButton>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
