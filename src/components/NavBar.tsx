import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenText, FileText, CheckSquare, LayoutDashboard, Layout } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '../App';

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get authentication state from global context
  const { isLoggedIn, setIsLoggedIn } = React.useContext(AuthContext);
  
  const handleLogout = () => {
    // Logout using the context
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
        
        {/* Show navigation links for all users */}
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
          <Link to="/dashboard2" className="text-gray-600 hover:text-ergi-primary transition-colors font-medium text-sm flex items-center gap-1">
            <Layout className="h-4 w-4" />
            <span>Mon Espace</span>
          </Link>
        </nav>
        
        {/* Keep the login buttons but they're not functional for now */}
        <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </header>
  );
};

export default NavBar;
