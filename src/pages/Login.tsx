
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { BookOpenText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse e-mail valide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize the form with validation schema
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: LoginFormValues) => {
    console.log('Tentative de connexion avec:', data);
    
    // Simulated login success for MVP testing purposes
    toast({
      title: "Connexion réussie",
      description: "Bienvenue sur ERGI, votre assistant pédagogique.",
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 mb-6">
            <BookOpenText className="h-10 w-10 text-ergi-primary" />
            <span className="font-bold text-2xl text-ergi-primary">ERGI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-600 mt-2 text-center">
            Accédez à votre espace d'assistant pédagogique
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse e-mail</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="votre@email.fr" 
                        {...field} 
                        data-testid="login-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        data-testid="login-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-ergi-primary hover:bg-ergi-dark"
                data-testid="login-submit"
              >
                Se connecter
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte?{" "}
              <Link to="/register" className="text-ergi-primary font-medium hover:underline">
                S'inscrire
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-4">
              <Link to="/reset-password" className="hover:underline">
                Mot de passe oublié?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
