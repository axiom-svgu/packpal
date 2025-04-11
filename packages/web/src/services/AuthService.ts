import { post } from "./HttpHelper";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
  success: boolean;
  message: string;
}

export const authService = {
  signIn: async (credentials: SignInRequest) => {
    const response = await post<AuthResponse>("/auth/login", credentials);

    if (response.data?.data.token) {
      localStorage.setItem("token", response.data.data.token);
    }

    return response;
  },

  signUp: async (userData: SignUpRequest) => {
    const response = await post<AuthResponse>("/auth/register", userData);

    if (response.data?.data.token) {
      localStorage.setItem("token", response.data.data.token);
    }

    return response;
  },

  signOut: () => {
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};
