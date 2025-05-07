
import React from 'react';
import { Link } from 'react-router-dom';
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
const resetSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse e-mail valide'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const { toast } = useToast();

  // Initialize the form with validation schema
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: ResetFormValues) => {
    console.log('Demande de réinitialisation pour:', data.email);
    
    // Simulated reset email sent for MVP testing purposes
    toast({
      title: "Email envoyé",
      description: "Si cette adresse est associée à un compte, vous recevrez un e-mail avec des instructions pour réinitialiser votre mot de passe.",
    });
    
    form.reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 mb-6">
            <BookOpenText className="h-10 w-10 text-ergi-primary" />
            <span className="font-bold text-2xl text-ergi-primary">ERGI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</h1>
          <p className="text-gray-600 mt-2 text-center">
            Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe
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
                        data-testid="reset-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-ergi-primary hover:bg-ergi-dark"
                data-testid="reset-submit"  
              >
                Envoyer le lien de réinitialisation
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <Link to="/login" className="text-ergi-primary font-medium hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
