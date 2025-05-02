
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckSquare, 
  Upload, 
  ArrowRight, 
  Download, 
  Copy, 
  FileText 
} from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';

const Correct = () => {
  const [evaluation, setEvaluation] = useState("");
  const [studentResponse, setStudentResponse] = useState("");
  const [correctionResult, setCorrectionResult] = useState<string | null>(null);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const { toast } = useToast();

  const handleCorrect = () => {
    if (!evaluation || !studentResponse) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez fournir à la fois l'évaluation et la réponse de l'élève.",
        variant: "destructive"
      });
      return;
    }

    setIsCorrecting(true);
    
    // Simuler l'appel à un modèle IA (remplacer par un vrai appel d'API)
    setTimeout(() => {
      const sampleCorrection = `# Correction de l'évaluation

## Note globale : 14/20

### Détail des points par question

| Question | Points obtenus | Points max | Commentaire |
|----------|---------------|------------|-------------|
| Question 1 | 4/5 | 5 | Bonne définition mais imprécise sur certains aspects |
| Question 2 | 3/5 | 5 | Deux approches théoriques manquantes |
| Exercice 1 | 5/7 | 7 | Méthode correcte mais erreur de calcul à l'étape 3 |
| Exercice 2 | 7/8 | 8 | Très bonne analyse du document |
| Synthèse | 5/5 | 5 | Excellente application des concepts avec exemples pertinents |

### Feedback général
L'élève montre une bonne compréhension des concepts clés et parvient à les appliquer.
Points forts : analyse de documents et capacité de synthèse.
Points à améliorer : précision dans les définitions et rigueur dans les calculs.

### Commentaires détaillés par question

**Question 1** : La définition est correcte dans ses grandes lignes, mais manque de précision concernant les limites du concept.

**Question 2** : L'élève a bien présenté 2 approches sur 4. Les approches structuraliste et fonctionnaliste n'ont pas été mentionnées.

**Exercice 1** : Le raisonnement est correct, mais une erreur de calcul s'est glissée à l'étape 3, ce qui a affecté la suite de la résolution.

**Exercice 2** : Excellente analyse, tous les éléments importants ont été identifiés et correctement interprétés.

**Synthèse** : Très bonne capacité à faire le lien entre théorie et pratique. Les exemples choisis sont pertinents et bien développés.
`;
      
      setCorrectionResult(sampleCorrection);
      setIsCorrecting(false);
      
      toast({
        title: "Correction terminée",
        description: "La correction de l'évaluation a été générée avec succès.",
      });
    }, 2500);
  };

  const copyToClipboard = () => {
    if (correctionResult) {
      navigator.clipboard.writeText(correctionResult);
      toast({
        title: "Contenu copié",
        description: "La correction a été copiée dans le presse-papier.",
      });
    }
  };

  const downloadAsText = () => {
    if (correctionResult) {
      const element = document.createElement("a");
      const file = new Blob([correctionResult], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `correction-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-2 mb-2">
          <CheckSquare className="h-5 w-5 text-ergi-primary" />
          <h1 className="text-2xl font-bold">Corriger une évaluation</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Fournissez le sujet d'évaluation et la réponse de l'élève pour obtenir une correction détaillée.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de correction */}
          <Card>
            <CardHeader>
              <CardTitle>Informations pour la correction</CardTitle>
              <CardDescription>
                Veuillez fournir le sujet de l'évaluation et la réponse de l'élève.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="text-input">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="text-input">Saisie de texte</TabsTrigger>
                  <TabsTrigger value="file-upload">Importer des fichiers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text-input" className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="evaluation">Sujet de l'évaluation</Label>
                    <Textarea 
                      id="evaluation"
                      placeholder="Collez ici le contenu de votre sujet d'évaluation..."
                      className="min-h-[150px]"
                      value={evaluation}
                      onChange={(e) => setEvaluation(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="student-response">Réponse de l'élève</Label>
                    <Textarea 
                      id="student-response"
                      placeholder="Collez ici la réponse de l'élève..."
                      className="min-h-[150px]"
                      value={studentResponse}
                      onChange={(e) => setStudentResponse(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="file-upload" className="pt-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Fichier du sujet d'évaluation</Label>
                      <div className="flex items-center gap-2">
                        <Input type="file" id="evaluation-file" className="flex-1" />
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" /> Importer
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fichier de réponse de l'élève</Label>
                      <div className="flex items-center gap-2">
                        <Input type="file" id="student-file" className="flex-1" />
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" /> Importer
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="space-y-2">
                <Label>Critères de correction (optionnel)</Label>
                <Textarea 
                  placeholder="Précisez vos critères d'évaluation ou barème spécifique..."
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  Ces informations aideront l'IA à adapter sa correction à vos attentes pédagogiques.
                </p>
              </div>
              
              <Button 
                onClick={handleCorrect}
                className="w-full bg-ergi-primary hover:bg-ergi-dark"
                disabled={isCorrecting}
              >
                {isCorrecting ? (
                  "Correction en cours..."
                ) : (
                  <>
                    Corriger l'évaluation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* Résultat de la correction */}
          <Card>
            <CardHeader>
              <CardTitle>Correction générée</CardTitle>
              <CardDescription>
                La correction détaillée apparaîtra ici une fois générée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {correctionResult ? (
                <div className="bg-gray-50 border rounded-md p-4 font-mono text-sm whitespace-pre-wrap min-h-[400px] max-h-[500px] overflow-y-auto">
                  {correctionResult}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 border rounded-md p-4 text-gray-400">
                  <FileText className="h-16 w-16 mb-4 opacity-50" />
                  <p>La correction apparaîtra ici</p>
                  <p className="text-sm mt-2">Complétez le formulaire et cliquez sur "Corriger l'évaluation"</p>
                </div>
              )}
            </CardContent>
            {correctionResult && (
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" onClick={downloadAsText}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                <Button className="bg-ergi-primary hover:bg-ergi-dark">
                  Finaliser et enregistrer
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Correct;
