
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenText, FileText, CheckSquare, LayoutDashboard, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Simulate user authentication state - in a real app, this would come from an auth context
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  const handleLogout = () => {
    // Simulate logout
    setIsLoggedIn(false);
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur ERGI!",
    });
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpenText className="h-8 w-8 text-ergi-primary" />
          <span className="font-bold text-xl text-ergi-primary">ERGI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/generate" className="text-gray-600 hover:text-ergi-primary transition-colors font-medium text-sm flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Générer une évaluation</span>
          </Link>
          <Link to="/correct" className="text-gray-600 hover:text-ergi-primary transition-colors font-medium text-sm flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            <span>Corriger une évaluation</span>
          </Link>
          <Link to="/dashboard" className="text-gray-600 hover:text-ergi-primary transition-colors font-medium text-sm flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            <span>Tableau de bord</span>
          </Link>
        </nav>
        <div className="flex items-center space-x-2">
          {isLoggedIn ? (
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
