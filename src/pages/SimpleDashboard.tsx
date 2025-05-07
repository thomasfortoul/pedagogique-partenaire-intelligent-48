
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import NavBar from '@/components/NavBar';
import { ArrowLeft, FileText, Calendar, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Course } from '@/types/course';

const SimpleDashboard = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = React.useContext(AuthContext);
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);

  // Load course data from localStorage
  useEffect(() => {
    const storedCoursesString = localStorage.getItem('courses');
    if (storedCoursesString) {
      try {
        const storedCourses = JSON.parse(storedCoursesString);
        const foundCourse = storedCourses.find((c: Course) => c.id === courseId);
        
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          toast({
            title: "Cours introuvable",
            description: "Ce cours n'existe pas ou vous n'y avez pas accès.",
            variant: "destructive"
          });
          navigate('/dashboard2');
        }
      } catch (error) {
        console.error("Error parsing courses data:", error);
        navigate('/dashboard2');
      }
    } else {
      navigate('/dashboard2');
    }
  }, [courseId, navigate, toast]);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Card>
            <CardContent className="flex items-center justify-center p-10">
              <p>Chargement...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header with back button and title */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex gap-1 items-center" 
              onClick={() => navigate('/dashboard2')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux cours</span>
            </Button>
            <h1 className="text-2xl font-bold">{course.title}</h1>
          </div>
        </div>
        
        {/* Simple card with course details */}
        <Card className="mb-6 overflow-hidden border-t-4 border-ergi-primary">
          <CardHeader className="bg-white pb-2">
            <CardTitle className="text-xl">Vue simplifiée du cours</CardTitle>
            <CardDescription>
              Dashboard minimal avec les informations essentielles
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Information */}
              <div className="space-y-4">
                {course.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                    <p className="mt-1">{course.description}</p>
                  </div>
                )}
                
                {course.level && (
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-500">Niveau:</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {course.level}
                    </span>
                  </div>
                )}
                
                {course.session && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ergi-primary" />
                    <h4 className="text-sm font-semibold text-gray-500">Session:</h4>
                    <span>{course.session}</span>
                  </div>
                )}
              </div>
              
              {/* Documents Count */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-ergi-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-ergi-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Documents</h4>
                    <p className="text-sm text-gray-600">
                      {course.documents?.length || 0} document{(course.documents?.length || 0) !== 1 ? 's' : ''} disponible{(course.documents?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/course/${courseId}`)}
                  >
                    Voir les documents
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(`/course/${courseId}/dashboard`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard complet
          </Button>
          
          <Button 
            className="bg-ergi-primary hover:bg-ergi-dark flex items-center gap-2"
            onClick={() => navigate('/generate')}
          >
            <FileText className="h-4 w-4" />
            Générer une évaluation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
