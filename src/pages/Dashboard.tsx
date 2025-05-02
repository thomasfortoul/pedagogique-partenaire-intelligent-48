
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { LayoutDashboard, FileText, CheckSquare, Clock, Award, Users, Book, Eye } from 'lucide-react';
import NavBar from '@/components/NavBar';

// Données d'exemple pour les graphiques
const evaluationData = [
  { name: 'Mathématiques', count: 14 },
  { name: 'Français', count: 8 },
  { name: 'Histoire-Géo', count: 5 },
  { name: 'Sciences', count: 7 },
  { name: 'Anglais', count: 4 },
];

const timeData = [
  { name: 'Création', value: 40 },
  { name: 'Correction', value: 35 },
  { name: 'Analyse', value: 25 },
];

const COLORS = ['#2563EB', '#10B981', '#4F46E5', '#F59E0B', '#EC4899'];

const recentEvaluations = [
  { 
    id: 1, 
    title: 'Fractions et nombres décimaux', 
    subject: 'Mathématiques', 
    level: 'CM2', 
    date: '2025-04-28',
    status: 'Corrigé'
  },
  { 
    id: 2, 
    title: 'Conjugaison - Passé simple', 
    subject: 'Français', 
    level: 'CM2', 
    date: '2025-04-25',
    status: 'Corrigé'
  },
  { 
    id: 3, 
    title: 'La Révolution française', 
    subject: 'Histoire', 
    level: 'CM2', 
    date: '2025-04-22',
    status: 'En attente'
  },
  { 
    id: 4, 
    title: 'Le système solaire', 
    subject: 'Sciences', 
    level: 'CM1', 
    date: '2025-04-20',
    status: 'Corrigé'
  },
];

const classPerformance = [
  { 
    id: 1, 
    name: 'CM2-A', 
    avgScore: 14.2, 
    evaluations: 12,
    students: 24,
    trend: 'up'
  },
  { 
    id: 2, 
    name: 'CM2-B', 
    avgScore: 13.5, 
    evaluations: 11,
    students: 23,
    trend: 'stable'
  },
  { 
    id: 3, 
    name: 'CM1-A', 
    avgScore: 12.8, 
    evaluations: 9,
    students: 25,
    trend: 'down'
  },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="h-5 w-5 text-ergi-primary" />
              <h1 className="text-2xl font-bold">Tableau de bord</h1>
            </div>
            <p className="text-gray-600">
              Aperçu de votre activité pédagogique et des performances.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Ce mois
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button className="bg-ergi-primary hover:bg-ergi-dark" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Nouvelle évaluation
            </Button>
          </div>
        </div>
        
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Évaluations créées</p>
                  <p className="text-2xl font-bold">38</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 flex items-center">
                <span className="font-medium">+12%</span>
                <span className="ml-1 text-gray-500">depuis le mois dernier</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Évaluations corrigées</p>
                  <p className="text-2xl font-bold">31</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 flex items-center">
                <span className="font-medium">+8%</span>
                <span className="ml-1 text-gray-500">depuis le mois dernier</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Temps économisé</p>
                  <p className="text-2xl font-bold">14h30</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-green-600 flex items-center">
                <span className="font-medium">+22%</span>
                <span className="ml-1 text-gray-500">depuis le mois dernier</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Note moyenne</p>
                  <p className="text-2xl font-bold">13.5/20</p>
                </div>
                <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-ergi-primary" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600 flex items-center">
                <span className="font-medium">~</span>
                <span className="ml-1 text-gray-500">stable</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Graphiques d'analyse */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Évaluations par matière</CardTitle>
              <CardDescription>
                Répartition des évaluations créées par matière
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evaluationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Temps économisé par activité</CardTitle>
              <CardDescription>
                Répartition du temps gagné par type d'activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Onglets des activités récentes et de la performance */}
        <Tabs defaultValue="recent" className="mb-8">
          <TabsList className="grid grid-cols-2 w-full max-w-[400px] mb-4">
            <TabsTrigger value="recent">Activités récentes</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Évaluations récentes</CardTitle>
                <CardDescription>
                  Liste de vos dernières évaluations créées ou corrigées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Titre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Matière</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Niveau</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvaluations.map((evaluation) => (
                        <tr key={evaluation.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{evaluation.title}</td>
                          <td className="py-3 px-4">{evaluation.subject}</td>
                          <td className="py-3 px-4">{evaluation.level}</td>
                          <td className="py-3 px-4">{evaluation.date}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              evaluation.status === 'Corrigé' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {evaluation.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm">Voir</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button variant="outline">
                    Afficher toutes les évaluations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance par classe</CardTitle>
                <CardDescription>
                  Aperçu des résultats de vos classes sur les évaluations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Classe</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Note moyenne</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Évaluations</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Élèves</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Tendance</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {classPerformance.map((cls) => (
                        <tr key={cls.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{cls.name}</td>
                          <td className="py-3 px-4">{cls.avgScore}/20</td>
                          <td className="py-3 px-4">{cls.evaluations}</td>
                          <td className="py-3 px-4">{cls.students}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center ${
                              cls.trend === 'up' 
                                ? 'text-green-600' 
                                : cls.trend === 'down' 
                                ? 'text-red-600' 
                                : 'text-gray-600'
                            }`}>
                              {cls.trend === 'up' && '↑ '}
                              {cls.trend === 'down' && '↓ '}
                              {cls.trend === 'stable' && '→ '}
                              {cls.trend}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm">Analyser</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                          <Book className="h-6 w-6 text-ergi-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Matière avec meilleure performance</p>
                          <p className="text-xl font-bold">Sciences</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xl font-bold text-ergi-primary">15.2/20</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-ergi-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-ergi-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Progrès global des élèves</p>
                          <p className="text-xl font-bold">+8.5%</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          ce trimestre
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
