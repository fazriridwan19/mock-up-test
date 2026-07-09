import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  // Required so the browser sends httpOnly cookies on every request
  withCredentials: true,
});

// ── Refresh lock ──────────────────────────────────────────────────────────────
// Prevents multiple simultaneous requests from each triggering a refresh call.
// All requests that arrive during a refresh are queued and retried after.

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function drainQueue(error: unknown | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
}

// ── Response interceptor ──────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Never try to refresh the refresh endpoint itself — that would loop
    if (originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    isRefreshing = true;

    try {
      // Call refresh — backend rotates both cookies in the response
      await api.post('/auth/refresh');
      drainQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      drainQueue(refreshError);
      // Refresh failed — session is dead, send to login
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

function clearAuthAndRedirect() {
  // Clear stored user profile from zustand persistence
  localStorage.removeItem('auth-storage');
  window.location.replace('/login');
}
