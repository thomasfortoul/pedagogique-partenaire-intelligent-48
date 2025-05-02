
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenText, FileText, CheckSquare, LayoutDashboard } from 'lucide-react';

const NavBar = () => {
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
          <Button variant="outline" size="sm">Se connecter</Button>
          <Button className="bg-ergi-primary hover:bg-ergi-dark" size="sm">S'inscrire</Button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
