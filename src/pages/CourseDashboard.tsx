
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import NavBar from '@/components/NavBar';
import { ArrowLeft, FileText, Settings, PenLine, BookOpen, Users, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Course } from '@/types/course';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CourseDashboard = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = React.useContext(AuthContext);
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  
  // Récupérer les données du cours depuis le localStorage
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
  
  // Données d'exemple pour les statistiques (à remplacer par des données réelles plus tard)
  const courseStatistics = {
    documentCount: course?.documents?.length || 0,
    totalSize: course?.documents?.reduce((total, doc) => total + doc.fileSize, 0) || 0,
    averageScore: 14.2,
    studentCount: 25,
    lastActivity: new Date().toLocaleDateString()
  };
  
  const studentData = [
    { id: 1, name: "Emma Duval", averageScore: 16.5, evaluations: 5, lastActivity: "2025-05-02" },
    { id: 2, name: "Lucas Martin", averageScore: 14.8, evaluations: 5, lastActivity: "2025-05-03" },
    { id: 3, name: "Chloé Bernard", averageScore: 12.5, evaluations: 4, lastActivity: "2025-05-01" },
    { id: 4, name: "Hugo Dubois", averageScore: 15.2, evaluations: 5, lastActivity: "2025-05-04" },
  ];
  
  // Si le cours n'est pas encore chargé, afficher un écran de chargement
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
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* En-tête du dashboard du cours */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex gap-1 items-center p-0" 
                onClick={() => navigate('/dashboard2')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
            </div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-gray-600 mt-1">
              Tableau de bord du cours {course.level && `• ${course.level}`}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/course/${courseId}`)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Personnaliser
            </Button>

            <Button
              className="bg-ergi-primary hover:bg-ergi-dark"
              onClick={() => navigate(`/generate/${courseId}`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Générer une évaluation
            </Button>
          </div>
        </div>
        
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Documents</p>
                  <p className="text-2xl font-bold">{courseStatistics.documentCount}</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                {courseStatistics.totalSize > 0 && (
                  <span>{(courseStatistics.totalSize / (1024 * 1024)).toFixed(1)} Mo stockés</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Élèves</p>
                  <p className="text-2xl font-bold">{courseStatistics.studentCount}</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                <span>Inscrits au cours</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dernière activité</p>
                  <p className="text-2xl font-bold">{courseStatistics.lastActivity}</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                <span>Activité récente</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Note moyenne</p>
                  <p className="text-2xl font-bold">{courseStatistics.averageScore}/20</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                <span>Performance globale</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contenu principal en onglets */}
        <Tabs defaultValue="evaluations" className="mb-8">
          <TabsList className="grid grid-cols-3 w-full max-w-[600px] mb-4">
            <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
            <TabsTrigger value="students">Élèves</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Évaluations récentes</CardTitle>
                    <CardDescription>
                      Historique des évaluations pour ce cours
                    </CardDescription>
                  </div>

                  <Button
                    className="bg-ergi-primary hover:bg-ergi-dark"
                    onClick={() => navigate(`/generate/${courseId}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Nouvelle évaluation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Affichage des évaluations - à remplacer par des données réelles */}
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Aucune évaluation créée pour ce cours.

                    <Button
                      variant="link"
                      className="text-ergi-primary"
                      onClick={() => navigate(`/generate/${courseId}`)}
                    >
                      Créer votre première évaluation
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Élèves du cours</CardTitle>
                <CardDescription>
                  Liste des élèves inscrits à ce cours et leurs performances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Nom</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Note moyenne</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Évaluations</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Dernière activité</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{student.name}</td>
                          <td className="py-3 px-4">{student.averageScore}/20</td>
                          <td className="py-3 px-4">{student.evaluations}</td>
                          <td className="py-3 px-4">{student.lastActivity}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm">Détails</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analyses et statistiques</CardTitle>
                <CardDescription>
                  Aperçu des performances et statistiques du cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Les analyses seront disponibles après la création d'évaluations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Section Ressources pédagogiques */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ressources pédagogiques</CardTitle>
                <CardDescription>
                  Documents et supports de cours
                </CardDescription>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate(`/course/${courseId}`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Gérer les documents
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              {course.documents && course.documents.length > 0 ? (
                <p>{course.documents.length} document{course.documents.length > 1 ? 's' : ''} disponible{course.documents.length > 1 ? 's' : ''}</p>
              ) : (
                <p className="text-gray-500">
                  Aucun document n'a été ajouté à ce cours.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDashboard;
