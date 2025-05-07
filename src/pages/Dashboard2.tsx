
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, BookOpen, User, Settings } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '../App';

// Définition du schéma de validation pour le formulaire de profil
const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Données d'exemple pour les cours
const coursesData = [
  // Cette liste sera vide par défaut pour un nouvel utilisateur
];

const Dashboard2 = () => {
  const { toast } = useToast();
  const { isLoggedIn } = React.useContext(AuthContext);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // État local pour le prénom et le nom de l'enseignant
  const [teacher, setTeacher] = useState({
    firstName: 'Marie', // Valeur par défaut pour la démonstration
    lastName: 'Durand'
  });

  // Initialiser le formulaire avec les valeurs actuelles
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
    },
  });

  // Gérer la soumission du formulaire de modification de profil
  const onSubmit = (data: ProfileFormValues) => {
    // Dans une application réelle, cette fonction enverrait les données à l'API
    setTeacher({
      firstName: data.firstName,
      lastName: data.lastName,
    });

    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été mises à jour avec succès.",
    });

    setIsEditProfileOpen(false);
  };

  // Gérer l'ouverture du formulaire de modification
  const handleOpenEditProfile = () => {
    // Réinitialiser le formulaire avec les valeurs actuelles
    form.reset({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
    });
    setIsEditProfileOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* En-tête du tableau de bord avec message de bienvenue */}
        <Card className="mb-8">
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  Bonjour {teacher.firstName}
                </h1>
                <p className="text-gray-600 mt-1">
                  Bienvenue sur votre espace personnel ERGI
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenEditProfile}
                className="flex items-center gap-2 ml-auto"
              >
                <User className="h-4 w-4" />
                Modifier mon profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section des cours */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Mes cours</CardTitle>
                <CardDescription>
                  Gérez vos cours et créez de nouveaux contenus pédagogiques
                </CardDescription>
              </div>
              <Button className="bg-ergi-primary hover:bg-ergi-dark">
                <Plus className="h-4 w-4 mr-2" />
                Créer un cours
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {coursesData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coursesData.map((course, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <p>Contenu du cours ici</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Aucun cours créé</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                  Vous n'avez pas encore créé de cours. Cliquez sur "Créer un cours" pour commencer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section d'activités récentes (placeholder pour l'instant) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Activités récentes</CardTitle>
            <CardDescription>
              Suivez vos dernières activités sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune activité récente à afficher.</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Modal pour modifier le profil */}
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier mon profil</DialogTitle>
              <DialogDescription>
                Mettez à jour vos informations personnelles ci-dessous.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditProfileOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-ergi-primary hover:bg-ergi-dark">
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard2;
