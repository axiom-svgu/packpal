import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Import pages and layout
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import { ThemeProvider } from "./components/theme-provider";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";

// Create a browser router with routes
const protectedRoutes = [
  {
    path: "/",
    element: <DashboardPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/groups",
    element: <GroupsPage />,
    errorElement: <NotFound />,
  },
  {
    path: "/groups/:groupId",
    element: <GroupDetailsPage />,
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
