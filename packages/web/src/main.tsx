import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Import pages and layout
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import { ThemeProvider } from "./components/theme-provider";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MembersPage from "./pages/MembersPage";
import ToPackPage from "./pages/ToPackPage";
import PackedPage from "./pages/PackedPage";
import DeliveredPage from "./pages/DeliveredPage";
import PackingListsPage from "./pages/PackingListsPage";
import AssignItemsPage from "./pages/AssignItemsPage";
import ManageRolesPage from "./pages/ManageRolesPage";
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
    errorElement: <NotFound />,
  },
  {
    path: "/members",
    element: <MembersPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/to-pack",
    element: <ToPackPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/packed",
    element: <PackedPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/delivered",
    element: <DeliveredPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/packing-lists",
    element: <PackingListsPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/assign-items",
    element: <AssignItemsPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/manage-roles",
    element: <ManageRolesPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/create-event",
    element: <CreateEventPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/notifications",
    element: <NotificationsPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
    errorElement: <NotFound />,
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
    <RouterProvider router={router} />
  </ThemeProvider>
);
