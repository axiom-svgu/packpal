import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    console.log("Not authenticated or no user");
    return <Navigate to="/login" />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
        <div className="flex min-h-0 flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
