
import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
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
import { BookOpen, BookOpenText, Edit, Plus, Trash2, User } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useToast } from '@/components/ui/use-toast';
import { AuthContext } from '../App';
import CourseCard from '@/components/CourseCard';
import CourseForm from '@/components/CourseForm';
import { Course } from '@/types/course';

// Schema definition for the profile form
const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Mock data for initial course list
const initialCoursesData: Course[] = [
  // Empty by default for new users
];

const Dashboard2 = () => {
  const { toast } = useToast();
  const { isLoggedIn } = React.useContext(AuthContext);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>(initialCoursesData);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

  // Teacher profile information
  const [teacher, setTeacher] = useState({
    firstName: 'Marie',
    lastName: 'Durand'
  });

  // Initialize the profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
    },
  });

  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
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

  // Open profile edit dialog
  const handleOpenEditProfile = () => {
    profileForm.reset({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
    });
    setIsEditProfileOpen(true);
  };

  // Add a new course
  const handleAddCourse = (course: Course) => {
    if (courses.length >= 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint la limite de 5 cours maximum.",
        variant: "destructive"
      });
      return;
    }
    
    const newCourse = {
      ...course,
      id: Date.now().toString(),
      // In a real app, we would get the teacher ID from the authenticated user
    };
    
    setCourses([...courses, newCourse]);
    toast({
      title: "Cours créé",
      description: `Le cours "${course.title}" a été créé avec succès.`,
    });
    setIsAddCourseOpen(false);
  };

  // Edit an existing course
  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsEditCourseOpen(true);
  };

  // Update a course
  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(courses.map(c => 
      c.id === updatedCourse.id ? updatedCourse : c
    ));
    toast({
      title: "Cours mis à jour",
      description: `Le cours "${updatedCourse.title}" a été mis à jour avec succès.`,
    });
    setIsEditCourseOpen(false);
  };

  // Delete a course
  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    toast({
      title: "Cours supprimé",
      description: "Le cours a été supprimé avec succès.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Dashboard header with welcome message */}
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

        {/* Courses section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Mes cours</CardTitle>
                <CardDescription>
                  Gérez vos cours et créez de nouveaux contenus pédagogiques
                  {courses.length >= 5 && (
                    <p className="text-amber-600 font-medium mt-1">
                      Limite: 5/5 cours atteinte
                    </p>
                  )}
                </CardDescription>
              </div>
              <Button 
                className="bg-ergi-primary hover:bg-ergi-dark"
                onClick={() => setIsAddCourseOpen(true)}
                disabled={courses.length >= 5}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un cours
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                  />
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

        {/* Recent activities section (placeholder) */}
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
        
        {/* Profile edit dialog */}
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier mon profil</DialogTitle>
              <DialogDescription>
                Mettez à jour vos informations personnelles ci-dessous.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 py-4">
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
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

        {/* Add course dialog */}
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Créer un nouveau cours</DialogTitle>
              <DialogDescription>
                Entrez les informations de votre nouveau cours.
              </DialogDescription>
            </DialogHeader>
            <CourseForm onSubmit={handleAddCourse} onCancel={() => setIsAddCourseOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Edit course dialog */}
        <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Modifier le cours</DialogTitle>
              <DialogDescription>
                Modifiez les informations de ce cours.
              </DialogDescription>
            </DialogHeader>
            {currentCourse && (
              <CourseForm 
                course={currentCourse} 
                onSubmit={handleUpdateCourse} 
                onCancel={() => setIsEditCourseOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard2;
