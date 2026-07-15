import { api } from "./api";
import type { ApiResponse, User } from "../types";

interface LoginPayload {
  email: string;
  password: string;
}

// Login response no longer contains accessToken — token lives in httpOnly cookie
interface LoginResponse {
  user: User;
}

interface SignUpResponse {
  user: User;
}

export const authService = {
  /**
   * POST /auth/login
   * Backend sets access_token + refresh_token as httpOnly cookies.
   * Only the user profile is returned in the response body.
   */
  async login(payload: LoginPayload): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>("/auth/login", payload);
    return data.data;
  },

  /**
   * POST /auth/signup
   */
  async signUp(email: string, password: string): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>("/auth/signup", {
      email,
      password,
    });
    return data.data;
  },

  /**
   * POST /auth/refresh
   * Rotates both tokens. Called automatically by the axios interceptor.
   * Can also be called manually if needed.
   */
  async refresh(): Promise<void> {
    await api.post("/auth/refresh");
  },

  /**
   * POST /auth/logout
   * Backend clears httpOnly cookies and invalidates the refresh token hash.
   */
  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  /**
   * GET /auth/profile
   * Uses the access_token cookie automatically sent by the browser.
   * Returns the authenticated user profile.
   */
  async getProfile(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/profile");
    return data.data;
  },
};
