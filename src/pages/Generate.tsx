
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Upload, ArrowRight, Copy, Download } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  subject: z.string().min(1, { message: "Veuillez sélectionner une matière" }),
  level: z.string().min(1, { message: "Veuillez sélectionner un niveau" }),
  topic: z.string().min(3, { message: "Le sujet doit contenir au moins 3 caractères" }),
  duration: z.number().min(10).max(180),
  instructions: z.string().optional(),
});

const Generate = () => {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      level: "",
      topic: "",
      duration: 60,
      instructions: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true);
    
    // Simuler l'appel à un modèle IA (remplacer par un vrai appel d'API)
    setTimeout(() => {
      const sampleEvaluation = `# Évaluation de ${values.subject} - ${values.level}
      
## Sujet : ${values.topic}
Durée : ${values.duration} minutes

### Instructions
${values.instructions || "Répondez aux questions suivantes. Tous les documents sont autorisés."}

### Questions

1. **Question 1 (5 points)**
   Définissez le concept principal abordé dans le chapitre sur ${values.topic}.

2. **Question 2 (5 points)**
   Expliquez les différentes approches théoriques liées à ${values.topic}.

3. **Exercice 1 (7 points)**
   Résolvez le problème suivant en détaillant toutes les étapes de votre raisonnement.
   [Énoncé de l'exercice lié au sujet ${values.topic}]

4. **Exercice 2 (8 points)**
   Analysez le document suivant et répondez aux questions.
   [Document ou cas d'étude lié au sujet ${values.topic}]

5. **Question de synthèse (5 points)**
   En quoi les concepts étudiés dans ${values.topic} sont-ils applicables dans un contexte réel?
   Donnez au moins deux exemples concrets.
      `;
      
      setGeneratedContent(sampleEvaluation);
      setIsGenerating(false);
      
      toast({
        title: "Évaluation générée avec succès",
        description: "Vous pouvez maintenant modifier, copier ou télécharger votre évaluation.",
      });
    }, 2000);
  };

  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Contenu copié",
        description: "Le contenu a été copié dans le presse-papier.",
      });
    }
  };

  const downloadAsText = () => {
    if (generatedContent) {
      const element = document.createElement("a");
      const file = new Blob([generatedContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `evaluation-${form.getValues('subject')}-${new Date().toISOString().split('T')[0]}.txt`;
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
          <FileText className="h-5 w-5 text-ergi-primary" />
          <h1 className="text-2xl font-bold">Générer une évaluation</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Spécifiez vos critères et notre IA créera une évaluation personnalisée.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de génération */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de l'évaluation</CardTitle>
              <CardDescription>
                Définissez les critères pour générer une évaluation adaptée à vos besoins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matière</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une matière" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mathematiques">Mathématiques</SelectItem>
                              <SelectItem value="francais">Français</SelectItem>
                              <SelectItem value="histoire">Histoire-Géographie</SelectItem>
                              <SelectItem value="sciences">Sciences</SelectItem>
                              <SelectItem value="anglais">Anglais</SelectItem>
                              <SelectItem value="physique">Physique-Chimie</SelectItem>
                              <SelectItem value="svt">SVT</SelectItem>
                              <SelectItem value="technologie">Technologie</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un niveau" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cp">CP</SelectItem>
                              <SelectItem value="ce1">CE1</SelectItem>
                              <SelectItem value="ce2">CE2</SelectItem>
                              <SelectItem value="cm1">CM1</SelectItem>
                              <SelectItem value="cm2">CM2</SelectItem>
                              <SelectItem value="6eme">6ème</SelectItem>
                              <SelectItem value="5eme">5ème</SelectItem>
                              <SelectItem value="4eme">4ème</SelectItem>
                              <SelectItem value="3eme">3ème</SelectItem>
                              <SelectItem value="seconde">Seconde</SelectItem>
                              <SelectItem value="premiere">Première</SelectItem>
                              <SelectItem value="terminale">Terminale</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet de l'évaluation</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Les fractions, La conjugaison du passé simple" {...field} />
                        </FormControl>
                        <FormDescription>
                          Précisez le thème spécifique de l'évaluation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée de l'évaluation (minutes): {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={10}
                            max={180}
                            step={5}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                            className="pt-2"
                          />
                        </FormControl>
                        <FormDescription>
                          Définissez la durée recommandée pour cette évaluation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions spécifiques (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Précisez toute instruction spéciale à inclure dans l'évaluation" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Ajoutez des consignes particulières ou des points à aborder
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importer des documents
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-full bg-ergi-primary hover:bg-ergi-dark"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        "Génération en cours..."
                      ) : (
                        <>
                          Générer
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Résultat de la génération */}
          <Card>
            <CardHeader>
              <CardTitle>Évaluation générée</CardTitle>
              <CardDescription>
                Votre évaluation apparaîtra ici une fois générée. Vous pourrez la modifier avant de la finaliser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="bg-gray-50 border rounded-md p-4 font-mono text-sm whitespace-pre-wrap min-h-[400px] max-h-[500px] overflow-y-auto">
                  {generatedContent}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 border rounded-md p-4 text-gray-400">
                  <FileText className="h-16 w-16 mb-4 opacity-50" />
                  <p>L'évaluation générée apparaîtra ici</p>
                  <p className="text-sm mt-2">Complétez le formulaire et cliquez sur "Générer"</p>
                </div>
              )}
            </CardContent>
            {generatedContent && (
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

export default Generate;
