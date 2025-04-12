import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Toaster } from "./components/ui/sonner";

// Import pages and layout
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import { ThemeProvider } from "./components/theme-provider";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MembersPage from "./pages/MembersPage";
import KanbanPage from "./pages/KanbanPage";
import PackingListsPage from "./pages/PackingListsPage";
import AssignItemsPage from "./pages/AssignItemsPage";
import CreateEventPage from "./pages/CreateEventPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import ManageCategoriesPage from "./pages/ManageCategoriesPage";
import MyItemsPage from "./pages/MyItemsPage";
import SuggestItemsPage from "./pages/SuggestItemsPage";
// Create a browser router with routes
const protectedRoutes = [
  {
    path: "/",
    element: <DashboardPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/members",
    element: <MembersPage />,
  },
  {
    path: "/kanban",
    element: <KanbanPage />,
  },
  // Redirects from old routes to Kanban board
  {
    path: "/to-pack",
    element: <KanbanPage />,
  },
  {
    path: "/packed",
    element: <KanbanPage />,
  },
  {
    path: "/delivered",
    element: <KanbanPage />,
  },
  {
    path: "/packing-lists",
    element: <PackingListsPage />,
  },
  {
    path: "/assign-items",
    element: <AssignItemsPage />,
  },
  {
    path: "/create-event",
    element: <CreateEventPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "/notifications",
    element: <NotificationsPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/manage-categories",
    element: <ManageCategoriesPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/my-items",
    element: <MyItemsPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/suggest-items",
    element: <SuggestItemsPage />,
    errorElement: <NotFound />,
  },
];

const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthPage />,
  },
  ...protectedRoutes.map((route) => ({
    ...route,
    element: <ProtectedRoute>{route.element}</ProtectedRoute>,
  })),
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

root.render(
  <ThemeProvider>
    <Toaster richColors closeButton />
    <RouterProvider router={router} />
  </ThemeProvider>
);
