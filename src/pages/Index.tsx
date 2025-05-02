
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpenText, FileText, CheckSquare, Brain, Clock, UserCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-ergi-light to-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-ergi-primary/10 px-4 py-1.5 rounded-full text-ergi-primary font-medium text-sm mb-2">
                Partenaire pédagogique intelligent
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Votre assistant <span className="text-ergi-primary">pédagogique</span> personnalisé
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                ERGI vous accompagne dans la création et la correction d'évaluations, 
                vous permettant de gagner du temps et d'optimiser votre efficacité pédagogique.
              </p>
              <div className="space-x-4">
                <Button size="lg" className="bg-ergi-primary hover:bg-ergi-dark">
                  Commencer maintenant
                </Button>
                <Button size="lg" variant="outline">
                  En savoir plus
                </Button>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Gain de temps estimé : <span className="font-medium">40%</span>
                </p>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-ergi-primary/5 rounded-lg -rotate-6"></div>
              <div className="bg-white shadow-lg rounded-lg p-6 relative animate-float">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpenText className="h-6 w-6 text-ergi-primary" />
                    <h3 className="font-semibold">Évaluation de mathématiques</h3>
                  </div>
                  <span className="bg-ergi-success/10 text-ergi-success text-xs px-2 py-1 rounded-full">Générée</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">1. Résoudre l'équation: 2x + 5 = 15</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">2. Calculer l'aire d'un cercle de rayon 4 cm.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded opacity-70">
                    <p className="text-sm">3. Factoriser: x² - 9</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Un partenaire intelligent pour chaque enseignant</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez comment ERGI peut vous aider à optimiser votre temps et améliorer la qualité de vos évaluations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-ergi-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Génération d'évaluations</h3>
              <p className="text-gray-600">
                Créez des évaluations personnalisées en fonction de vos besoins pédagogiques en quelques clics.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckSquare className="h-6 w-6 text-ergi-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Correction automatisée</h3>
              <p className="text-gray-600">
                Gagnez du temps avec notre système de correction intelligent qui s'adapte à vos critères d'évaluation.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-ergi-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personnalisation avancée</h3>
              <p className="text-gray-600">
                L'IA apprend de vos documents et méthodes pour devenir votre véritable assistant pédagogique personnalisé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <UserCircle className="h-16 w-16 text-ergi-primary" />
              </div>
              <blockquote className="text-xl italic text-gray-700 mb-4">
                "ERGI m'a permis de réduire considérablement le temps passé à créer et corriger des évaluations. 
                Je peux maintenant consacrer plus de temps à l'accompagnement personnalisé de mes élèves."
              </blockquote>
              <cite className="text-gray-600 font-medium">
                Marie Dupont, Professeure de français
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ergi-primary">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à transformer votre approche pédagogique?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Rejoignez les enseignants qui ont déjà adopté ERGI comme partenaire pédagogique intelligent.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-ergi-primary hover:bg-gray-100">
            Commencer gratuitement
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-12 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpenText className="h-8 w-8 text-white" />
              <span className="font-bold text-xl text-white">ERGI</span>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                Accueil
              </Link>
              <Link to="/generate" className="text-gray-300 hover:text-white transition-colors text-sm">
                Générer
              </Link>
              <Link to="/correct" className="text-gray-300 hover:text-white transition-colors text-sm">
                Corriger
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                À propos
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} ERGI - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
