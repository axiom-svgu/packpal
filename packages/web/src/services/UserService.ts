import { get, put } from "./HttpHelper";
import { User } from "@/lib/store";

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    stats?: {
      groupsCount: number;
      assignedItemsCount: number;
      toPackCount: number;
      packedCount: number;
      deliveredCount: number;
    };
  };
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const userService = {
  // Get the current user profile
  getProfile: async () => {
    return await get<ProfileResponse>("/auth/profile");
  },

  // Update the user profile
  updateProfile: async (profileData: UpdateProfileRequest) => {
    return await put<ProfileResponse>("/auth/profile", profileData);
  },
};
