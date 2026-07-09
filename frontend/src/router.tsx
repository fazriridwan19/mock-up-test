import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { LoginPage } from './features/auth/LoginPage';
import { SignUpPage } from './features/auth/SignUpPage';
import { BiodataPage } from './features/biodata/BiodataPage';
import { AdminPage } from './features/admin/AdminPage';
import { AppLayout } from './layouts/AppLayout';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Read the persisted user from zustand's localStorage key.
 * Returns null when there is no session (user has not logged in or was cleared).
 */
function getPersistedUser(): { role: string } | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { user?: { role: string } | null } };
    return parsed?.state?.user ?? null;
  } catch {
    return null;
  }
}

// ── Root ──────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: Outlet });

// ── Public routes ─────────────────────────────────────────────────────────────

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    // Already authenticated → skip login page
    if (getPersistedUser()) {
      throw redirect({ to: '/biodata' });
    }
  },
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
  beforeLoad: () => {
    if (getPersistedUser()) {
      throw redirect({ to: '/biodata' });
    }
  },
});

// ── Protected layout ──────────────────────────────────────────────────────────

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppLayout,
  beforeLoad: () => {
    // No cached user → send to login.
    // The actual cookie validity is enforced by the backend on every API call.
    // The axios interceptor auto-refreshes the token and redirects on failure.
    if (!getPersistedUser()) {
      throw redirect({ to: '/login' });
    }
  },
});

// ── User routes ───────────────────────────────────────────────────────────────

const biodataRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/biodata',
  component: BiodataPage,
});

// ── Admin routes ──────────────────────────────────────────────────────────────

const adminRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin',
  component: AdminPage,
  beforeLoad: () => {
    const user = getPersistedUser();
    if (!user) {
      throw redirect({ to: '/login' });
    }
    if (user.role !== 'ADMIN') {
      throw redirect({ to: '/biodata' });
    }
  },
});

// ── Index redirect ────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: getPersistedUser() ? '/biodata' : '/login' });
  },
  component: () => null,
});

// ── Route tree ────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  appLayoutRoute.addChildren([biodataRoute, adminRoute]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
