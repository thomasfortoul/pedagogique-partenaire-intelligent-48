import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
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
import { AuthProvider, useAuth } from './lib/auth/auth-context'; // Import AuthProvider and useAuth

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth(); // Use user and isLoading from useAuth
  
  if (isLoading) {
    // Optionally render a loading spinner or placeholder
    return <div>Loading authentication...</div>; 
  }

  if (!user) { // Check if user is null
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> {/* Use the new AuthProvider */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/generate/:courseId?" element={
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
      </AuthProvider> {/* Close AuthProvider */}
    </QueryClientProvider>
  );
};

export default App;
