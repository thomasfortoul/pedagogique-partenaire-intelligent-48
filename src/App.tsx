
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import Correct from "./pages/Correct";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

// Simple authentication context
export const AuthContext = React.createContext({
  isLoggedIn: false,
  setIsLoggedIn: (value: boolean) => {}
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = React.useContext(AuthContext);
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
