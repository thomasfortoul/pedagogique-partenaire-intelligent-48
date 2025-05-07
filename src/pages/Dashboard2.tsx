
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
import { useToast } from '@/hooks/use-toast';
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

const Dashboard2 = () => {
  const { toast } = useToast();
  const { isLoggedIn } = React.useContext(AuthContext);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

  // Teacher profile information
  const [teacher, setTeacher] = useState({
    firstName: 'Marie',
    lastName: 'Durand'
  });

  // Load courses from localStorage on initial render
  useEffect(() => {
    const storedCoursesString = localStorage.getItem('courses');
    if (storedCoursesString) {
      try {
        const storedCourses = JSON.parse(storedCoursesString);
        setCourses(storedCourses);
      } catch (error) {
        console.error("Error parsing stored courses:", error);
      }
    }
  }, []);

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
      documents: [],
    };
    
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    
    // Store in localStorage for persistence
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
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
    const updatedCourses = courses.map(c => 
      c.id === updatedCourse.id ? { ...updatedCourse, documents: c.documents || [] } : c
    );
    
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
    toast({
      title: "Cours mis à jour",
      description: `Le cours "${updatedCourse.title}" a été mis à jour avec succès.`,
    });
    setIsEditCourseOpen(false);
  };

  // Delete a course
  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter(c => c.id !== courseId);
    setCourses(updatedCourses);
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
    toast({
      title: "Cours supprimé",
      description: "Le cours a été supprimé avec succès.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Dashboard header with welcome message */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-ergi-dark">
            Bonjour {teacher.firstName}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Bienvenue sur votre espace personnel ERGI
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenEditProfile}
            className="flex items-center gap-2 mx-auto mt-6 bg-white hover:bg-gray-100"
          >
            <User className="h-4 w-4" />
            Modifier mon profil
          </Button>
        </div>

        {/* Courses section */}
        <div className="mb-12 bg-transparent p-0">
          <div className="flex flex-col items-center justify-between mb-8 md:flex-row">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-900">Mes cours</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gérez vos cours et créez de nouveaux contenus pédagogiques
                {courses.length >= 5 && (
                  <span className="text-amber-600 font-medium ml-2">
                    Limite: 5/5 cours atteinte
                  </span>
                )}
              </p>
            </div>
            <Button 
              className="bg-ergi-primary hover:bg-ergi-dark shadow-md"
              onClick={() => setIsAddCourseOpen(true)}
              disabled={courses.length >= 5}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un cours
            </Button>
          </div>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-4">
              <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-xl font-medium text-gray-800">Aucun cours créé</h3>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                Vous n'avez pas encore créé de cours. Cliquez sur "Créer un cours" pour commencer.
              </p>
              <Button 
                className="bg-ergi-primary hover:bg-ergi-dark shadow-sm mt-6"
                onClick={() => setIsAddCourseOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier cours
              </Button>
            </div>
          )}
        </div>

        {/* Recent activities section (placeholder) */}
        <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">Activités récentes</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Suivez vos dernières activités sur la plateforme
          </p>
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucune activité récente à afficher.</p>
          </div>
        </div>
        
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
