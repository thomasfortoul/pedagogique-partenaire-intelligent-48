import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect } from "react";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import OpenAITest from "./pages/OpenAITest";
import Correct from "./pages/Correct";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import CourseDetail from './pages/CourseDetail';
import CourseDashboard from './pages/CourseDashboard';
import SimpleDashboard from './pages/SimpleDashboard';

const queryClient = new QueryClient();

// Simple authentication context with sessionTimeout
export const AuthContext = React.createContext({
  isLoggedIn: false,
  setIsLoggedIn: (value: boolean) => {},
  refreshSession: () => {}
});

// Session timeout in milliseconds (1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000;

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, refreshSession } = React.useContext(AuthContext);
  
  // Refresh the session timer when accessing a protected route
  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    // Check localStorage for existing session when app loads
    const sessionData = localStorage.getItem('ergiSession');
    if (sessionData) {
      const { expiry } = JSON.parse(sessionData);
      if (expiry && expiry > Date.now()) {
        return true;
      }
      // Session expired, clear it
      localStorage.removeItem('ergiSession');
    }
    return false;
  });

  // Function to refresh the session
  const refreshSession = React.useCallback(() => {
    if (isLoggedIn) {
      const expiry = Date.now() + SESSION_TIMEOUT;
      localStorage.setItem('ergiSession', JSON.stringify({ expiry }));
    }
  }, [isLoggedIn]);

  // Set up session on login change
  useEffect(() => {
    if (isLoggedIn) {
      refreshSession();
    } else {
      localStorage.removeItem('ergiSession');
    }
  }, [isLoggedIn, refreshSession]);

  // Set up timer to check session expiry
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const checkSession = () => {
      const sessionData = localStorage.getItem('ergiSession');
      if (sessionData) {
        const { expiry } = JSON.parse(sessionData);
        if (expiry && expiry < Date.now()) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    
    // Check session every minute
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, refreshSession }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/generate" element={
                <ProtectedRoute>
                  <Generate />
                </ProtectedRoute>
              } />
              <Route path="/openai-test" element={<OpenAITest />} />
              <Route path="/correct" element={
                <ProtectedRoute>
                  <Correct />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard2" element={
                <ProtectedRoute>
                  <Dashboard2 />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/course/:courseId" 
                element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/course/:courseId/dashboard" 
                element={
                  <ProtectedRoute>
                    <CourseDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard-:courseId" 
                element={
                  <ProtectedRoute>
                    <SimpleDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
