import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Brain, History, Settings, LogOut, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: Brain },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains('dark');
    if (dark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar — desktop */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] overflow-hidden"
      >
        {/* Nav links */}
        <div className="flex-1 py-4 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}>
                <div
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[var(--accent)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <link.icon className="h-4.5 w-4.5 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="p-3 space-y-1 border-t border-[var(--border)]">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            {isDark ? <Sun className="h-4.5 w-4.5 shrink-0" /> : <Moon className="h-4.5 w-4.5 shrink-0" />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User + Logout */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!collapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={logout}
                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors shrink-0"
                  aria-label="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
