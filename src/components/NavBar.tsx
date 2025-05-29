"use client"
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenText, Layout, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../lib/auth/auth-context'; // Import useAuth

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if we're on a course page to extract courseId
  const coursePath = location.pathname.match(/\/course\/([^\/]+)/);
  const dashboardPath = location.pathname.match(/\/dashboard-([^\/]+)/);
  const courseId = coursePath ? coursePath[1] : (dashboardPath ? dashboardPath[1] : null);

  // Get authentication state from global context
  const { user, signOut, isLoading } = useAuth(); // Use user, signOut, and isLoading from useAuth
  
  // No need for explicit session refresh here, AuthProvider handles it
  // useEffect(() => {
  //   if (user) { // Check if user exists
  //     // refreshSession(); // This logic is now handled internally by AuthProvider
  //   }
  // }, [location.pathname, user]); // Depend on user instead of isLoggedIn

  const handleLogout = async () => { // Made async
    try {
      await signOut(); // Call signOut from useAuth
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt sur ERGI!"
      });
      navigate('/');
    } catch (error) {
      console.error('[NavBar] Error during logout:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive"
      });
    }
  };

  // Show loading state if authentication is still in progress
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpenText className="h-8 w-8 text-ergi-primary" />
            <span className="font-bold text-xl text-ergi-primary">ERGI</span>
          </Link>
          <div>Chargement...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpenText className="h-8 w-8 text-ergi-primary" />
          <span className="font-bold text-xl text-ergi-primary">ERGI</span>
        </Link>
        
        {/* Only show main feature navigation for logged in users */}
        {user ? ( // Check for user existence
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard2"
              className="text-gray-600 hover:text-ergi-primary transition-colors font-medium text-sm flex items-center gap-1"
            >
              <Layout className="h-4 w-4" />
              <span>Mon Espace</span>
            </Link>
            {courseId && (
              <>
                <Link
                  to={`/course/${courseId}/dashboard`}
                  className="text-gray-600 hover:text-ergi-primary transition-colors font-medium text-sm"
                >
                  Dashboard complet
                </Link>
                <Link
                  to={`/dashboard-${courseId}`}
                  className="text-gray-600 hover:text-ergi-primary transition-colors font-medium text-sm"
                >
                  Dashboard simple
                </Link>
              </>
            )}
          </nav>
        ) : null}
        
        <div className="flex items-center space-x-2">
          {user ? ( // Check for user existence
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1"
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter</span>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                data-testid="login-button"
              >
                Se connecter
              </Button>
              <Button
                className="bg-ergi-primary hover:bg-ergi-dark"
                size="sm"
                onClick={() => navigate('/register')}
                data-testid="register-button"
              >
                S'inscrire
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
