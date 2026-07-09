import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileUser,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";

const NAV_ITEMS = {
  USER: [{ to: "/biodata", label: "Biodata Saya", icon: FileUser }],
  ADMIN: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }],
} as const;

export function Sidebar() {
  const { user, clearUser } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path + "/");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // proceed even if request fails
    } finally {
      clearUser();
      window.location.replace("/login");
    }
  };

  const navItems = user?.role === "ADMIN" ? NAV_ITEMS.ADMIN : NAV_ITEMS.USER;

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 flex flex-col z-30
                      bg-linear-to-b from-slate-900 via-slate-800 to-slate-900
                      border-r border-white/5 shadow-2xl"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-400 to-blue-600
                        flex items-center justify-center shadow-lg shadow-blue-500/30"
        >
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">
            [APP_NAME]
          </p>
          <p className="text-slate-400 text-xs">Management System</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4">
        <span
          className={clsx(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
            user?.role === "ADMIN"
              ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30"
              : "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30",
          )}
        >
          {user?.role === "ADMIN" ? "⚡ Administrator" : "👤 Pengguna"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/8",
                )}
              >
                <Icon size={17} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="opacity-70" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div
            className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-blue-600
                          flex items-center justify-center text-white text-xs font-bold shrink-0"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-slate-300 text-xs font-medium truncate">
              {user?.email}
            </p>
            <p className="text-slate-500 text-xs">Sesi aktif</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                     text-slate-400 hover:text-red-400 hover:bg-red-500/10
                     text-sm font-medium transition-all duration-150 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut size={15} />
          )}
          {isLoggingOut ? "Keluar..." : "Keluar"}
        </motion.button>
      </div>
    </aside>
  );
}
