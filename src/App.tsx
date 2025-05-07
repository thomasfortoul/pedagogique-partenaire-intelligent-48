import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import Correct from "./pages/Correct";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import CourseDetail from './pages/CourseDetail';
import CourseDashboard from './pages/CourseDashboard';

const queryClient = new QueryClient();

// Simple authentication context - keeping it for future use
export const AuthContext = React.createContext({
  isLoggedIn: true, // Default to true so all routes are accessible
  setIsLoggedIn: (value: boolean) => {}
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Default to true

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/correct" element={<Correct />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard2" element={<Dashboard2 />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/course/:courseId" element={<CourseDetail />} />
              <Route path="/course/:courseId/dashboard" element={<CourseDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
