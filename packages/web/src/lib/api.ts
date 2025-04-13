// API URL for development and production
export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://packpal-api.axiomclub.tech"
    : "http://localhost:3000";

// Helper function for API requests with authentication
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
