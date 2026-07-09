import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
  /** Cached user profile. Source of truth for role-based UI. */
  user: User | null;

  /** Set user after successful login. */
  setUser: (user: User) => void;

  /** Clear user on logout or session expiry. */
  clearUser: () => void;

  /** True when we have a cached user profile (cookie validity is checked server-side). */
  isAuthenticated: () => boolean;

  isAdmin: () => boolean;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => set({ user }),

      clearUser: () => set({ user: null }),

      // Cookie httpOnly cannot be read by JS, so we use the cached user as
      // the optimistic indicator. The axios interceptor will auto-refresh
      // the token when the cookie expires; if refresh also fails the user
      // will be redirected to /login by the interceptor.
      isAuthenticated: () => get().user !== null,

      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'auth-storage',
      // Only persist the user profile, never tokens
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
