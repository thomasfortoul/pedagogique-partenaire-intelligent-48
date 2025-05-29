"use client"
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
import NavBar from '@/components/NavBar';
import { ArrowLeft, BookOpenText, Edit, FileText, Settings, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Course, Document } from '@/types/course';
import DocumentList from '@/components/DocumentList';
import UploadDocumentForm from '@/components/UploadDocumentForm';
import { useAuth } from '@/lib/auth/auth-context'; // Import useAuth

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth(); // Use user and isLoading from useAuth
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Constants for limits
  const MAX_DOCUMENTS = 20;
  const MAX_SIZE_MB = 10;
  const MAX_TOTAL_SIZE_MB = 50;
  
  // Calculate total size of all documents
  const totalDocumentsSize = documents.reduce((total, doc) => total + doc.fileSize, 0);
  const totalSizeMB = totalDocumentsSize / (1024 * 1024);

  // Redirect if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Get stored courses from localStorage - this is a temporary solution until we connect to Supabase
  useEffect(() => {
    if (!user) return; // Only fetch if user is authenticated

    const storedCoursesString = localStorage.getItem('courses');
    if (storedCoursesString) {
      try {
        const storedCourses = JSON.parse(storedCoursesString);
        const foundCourse = storedCourses.find((c: Course) => c.id === courseId);
        
        if (foundCourse) {
          setCourse(foundCourse);
          setDocuments(foundCourse.documents || []);
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
  }, [courseId, navigate, toast, user]); // Add user to dependency array

  const handleUploadComplete = (newDocument: Document) => {
    if (!course) return;
    
    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);
    
    // Update local storage
    const storedCoursesString = localStorage.getItem('courses');
    if (storedCoursesString) {
      try {
        const storedCourses = JSON.parse(storedCoursesString);
        const updatedCourses = storedCourses.map((c: Course) => {
          if (c.id === courseId) {
            return {
              ...c,
              documents: updatedDocuments
            };
          }
          return c;
        });
        
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
      } catch (error) {
        console.error("Error updating courses data:", error);
      }
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (!course) return;
    
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    
    // Update local storage
    const storedCoursesString = localStorage.getItem('courses');
    if (storedCoursesString) {
      try {
        const storedCourses = JSON.parse(storedCoursesString);
        const updatedCourses = storedCourses.map((c: Course) => {
          if (c.id === courseId) {
            return {
              ...c,
              documents: updatedDocuments
            };
          }
          return c;
        });
        
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        
        toast({
          title: "Document supprimé",
          description: "Le document a été supprimé avec succès.",
        });
      } catch (error) {
        console.error("Error updating courses data:", error);
      }
    }
  };

  if (isLoading || !user || !course) { // Add isLoading and !user to condition
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
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="flex gap-1 items-center" 
              onClick={() => navigate(`/course/${courseId}/dashboard`)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au dashboard</span>
            </Button>
            <h1 className="text-2xl font-bold">{course.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate(`/dashboard-${courseId}`)}
            >
              <Layout className="h-4 w-4" />
              Dashboard simplifié
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate(`/course/${courseId}/dashboard`)}
            >
              <Layout className="h-4 w-4" />
              Dashboard complet
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate('/dashboard2')}
            >
              <ArrowLeft className="h-4 w-4" />
              Mes cours
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpenText className="h-5 w-5 text-ergi-primary" />
                  <span>Documents du cours</span>
                </CardTitle>
                {totalDocumentsSize > 0 && (
                  <CardDescription>
                    {documents.length} document{documents.length > 1 ? 's' : ''} ({totalSizeMB.toFixed(1)} MB / {MAX_TOTAL_SIZE_MB} MB)
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <DocumentList 
                  documents={documents} 
                  onDelete={handleDeleteDocument}
                />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <UploadDocumentForm 
              courseId={course.id}
              onUploadComplete={handleUploadComplete}
              documentsCount={documents.length}
              maxDocuments={MAX_DOCUMENTS}
              maxSizeMB={MAX_SIZE_MB}
            />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Informations du cours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                    <p className="mt-1">{course.description}</p>
                  </div>
                )}
                
                {course.level && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">Niveau</h4>
                    <p className="mt-1">{course.level}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button
                    onClick={() => navigate('/dashboard2')}
                    variant="outline"
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier les informations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
