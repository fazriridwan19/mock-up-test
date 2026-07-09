import { Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* 256px = w-64 sidebar */}
      <main className="flex-1 ml-64 min-h-screen bg-slate-100">
        <div className="max-w-screen-xl mx-auto px-8 py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={routerState.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
