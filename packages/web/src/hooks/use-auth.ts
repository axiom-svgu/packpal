import { useAuthStore } from "@/lib/store";

export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };
}
