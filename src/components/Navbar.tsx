import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Brain, History, Settings, LogOut, Menu, X, Sun, Moon, Sparkles, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Brain },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  // Add Admin-only link
  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin/users', label: 'Users', icon: Users });
  }
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-card shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm group-hover:shadow-md transition-shadow">
            <Brain className="h-4.5 w-4.5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 border-2 border-[var(--bg)]" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tight">
            Sitara
            <span className="text-[var(--accent)]">.</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? 'dark' : 'light'}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? (
                  <Sun className="h-4.5 w-4.5 text-[var(--text-secondary)]" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-[var(--text-secondary)]" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          {isAuthenticated ? (
            <>
              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-0.5 ml-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link key={link.to} to={link.to}>
                      <button
                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                        {isActive && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--accent)]"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                      </button>
                    </Link>
                  );
                })}
              </div>

              {/* User area */}
              <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)] max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg-secondary)] transition-colors ml-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mobileOpen ? 'close' : 'open'}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-[var(--text-secondary)] hover:text-[var(--text)] rounded-xl">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gradient-primary text-white rounded-xl shadow-sm hover:shadow-md transition-shadow gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="border-t border-[var(--border)] md:hidden overflow-hidden bg-[var(--card)]"
          >
            <div className="container py-3 flex flex-col gap-0.5">
              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.to;
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={link.to} onClick={() => setMobileOpen(false)}>
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </button>
                    </Link>
                  </motion.div>
                );
              })}
              <div className="h-px bg-[var(--border)] my-1" />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
