import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HistoryPage from "./pages/HistoryPage";
import Settings from "./pages/Settings";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing has its own Navbar + Footer */}
            <Route path="/" element={<Landing />} />
            {/* Auth pages — no nav */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Dashboard pages — have DashboardLayout + shared Navbar */}
            <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
            <Route path="/history" element={<><Navbar /><HistoryPage /></>} />
            <Route path="/settings" element={<><Navbar /><Settings /></>} />
            <Route path="/admin/users" element={<><Navbar /><AdminUsers /></>} />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
