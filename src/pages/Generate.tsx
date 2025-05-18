import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import { Send, Copy, Download, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Names of each agent in the workflow
type AgentCallProps = { name: string };
const AGENT_NAMES = [
  'MainAgent',
  'ObjectiveAgent',
  'PedagogyAgent',
  'BloomAgent',
  'QuestionAgent',
  'ExamCreatorAgent',
];

function AgentCall({ name }: AgentCallProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-md"
    >
      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
        {name.charAt(0)}
      </div>
      <span className="font-semibold">{name}</span>
    </motion.div>
  );
}

// Hardcoded chat sequence for demonstration
const HARDCODED_SEQUENCE = [
  { role: 'system', content: "Bienvenue dans le Générateur d'examens pour Biologie introductive!\nQue souhaitez-vous créer aujourd'hui?" },
  { role: 'user', content: "Un examen pour Biologie introductive." },
  { role: 'system', content: "Très bien!\nQuels objectifs d'apprentissage voulez-vous évaluer?" },
  { role: 'user', content: "La structure cellulaire et les organites." },
  { role: 'system', content: "Le niveau d'application de Bloom semble adapté.\nVoulez-vous cibler ce niveau?" },
  { role: 'user', content: "Je préfère viser l'analyse." },
  { role: 'system', content: "Je comprends votre préférence pour le niveau d'analyse. \nCependant, comme il s'agit d'un cours introductif, combiner application et analyse s'adapte mieux aux détails de votre cours et aux objectifs d'apprentissage que vous avez fournis, en permettant aux étudiants de d'abord appliquer les concepts de base avant d'analyser en profondeur. \n\nCela vous convient-il?" },
  { role: 'user', content: "Oui, parfait." },
  { role: 'system', content: "Super!\nJe vais générer un examen avec des questions d'application et d'analyse sur la cellule.\nVoulez-vous ajouter d'autres critères?" },
  { role: 'user', content: "Non, c'est tout." },
  { role: 'system', content: "Voici un examen qui combine application et analyse,\naxé sur la structure cellulaire et les organites:" },
  { role: 'user', content: "Rends la question 2 plus facile." },
  { role: 'system', content: "Question 2 simplifiée.\nVoici la version mise à jour de l'examen." }
];

// Artifact representing the generated exam
const EXAM_ARTIFACT = {
  title: "Examen de Biologie introductive",
  course: "BIO 101 : Biologie introductive",
  duration: "2 heures",
  instructions: "Répondez à toutes les questions. Justifiez vos réponses pour obtenir tous les points.",
  questions: [
    {
      id: "q1",
      type: "Application",
      text: "Un patient présente des symptômes liés à un dysfonctionnement mitochondrial. \nExpliquez comment une anomalie des mitochondries peut affecter le métabolisme cellulaire et proposez une expérience pour tester cette hypothèse.",
      points: 10,
      difficulty: "Moyen"
    },
    {
      id: "q2",
      type: "Analyse",
      text: "Comparez la structure et la fonction du réticulum endoplasmique rugueux et lisse. \n Donnez un exemple de situation où chaque type serait particulièrement important dans une cellule spécialisée.",
      points: 15,
      difficulty: "Difficile"
    },
    {
      id: "q3",
      type: "Application",
      text: "Un biologiste observe une cellule qui ne parvient pas à produire suffisamment de protéines.\n Identifiez deux organites qui pourraient être responsables et justifiez votre réponse.",
      points: 10,
      difficulty: "Moyen"
    }
  ]
};

// Initial parameters for the task sidebar
const initialTaskParameters = {
  course: 'Biologie introductive',
  outputType: '',
  learningObjectives: '',
  bloomsLevel: '',
};

// Chat thinking bubble texts
const THINKING_CHAT = [
  '',
  "Analyse de la demande...",
  "Analyse des objectifs...",
  "Réflexion sur le niveau...",
  "Génération des questions...",
  "Compilation de l'examen...",
  "Prêt pour les modifications..."
];

const Generate = () => {
  const [step, setStep] = useState(0);
  const [currentAgent, setCurrentAgent] = useState(AGENT_NAMES[0]);
  const [messages, setMessages] = useState([
    { id: '0', role: 'system', content: HARDCODED_SEQUENCE[0].content, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [taskParameters, setTaskParameters] = useState(initialTaskParameters);
  const [showThinkingBubble, setShowThinkingBubble] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update agent badge based on current step
  useEffect(() => {
    const idx = Math.min(step, AGENT_NAMES.length - 1);
    setCurrentAgent(AGENT_NAMES[idx]);
  }, [step]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsGenerating(true);
    setShowThinkingBubble(true);
    setThinkingStep(THINKING_CHAT[Math.min(step + 1, THINKING_CHAT.length - 1)]);

    setTimeout(() => {
      setThinkingStep('');
      setTimeout(() => {
        setShowThinkingBubble(false);
        handleBotResponse(newUserMessage.content);
        setIsGenerating(false);
      }, 800);
    }, 800);
  };

  // Core logic for advancing chat and managing exam generation
  const handleBotResponse = (userInput) => {
    let nextStep = step;
    let nextMessages = [];
    let nextTaskParameters = { ...taskParameters };
    let shouldShowExam = false;
    let shouldUpdateExam = false;

    switch (step) {
      case 0:
        if (userInput.toLowerCase().includes('examen')) {
          nextTaskParameters = { ...nextTaskParameters, outputType: 'Examen', course: 'Biologie introductive' };
        }
        nextStep = 1;
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: HARDCODED_SEQUENCE[2].content, timestamp: new Date() }];
        break;
      case 1:
        nextTaskParameters = { ...nextTaskParameters, learningObjectives: userInput };
        nextStep = 2;
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: HARDCODED_SEQUENCE[4].content, timestamp: new Date() }];
        break;
      case 2:
        nextStep = 3;
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: HARDCODED_SEQUENCE[6].content, timestamp: new Date() }];
        break;
      case 3:
        if (userInput.toLowerCase().includes('oui') || userInput.toLowerCase().includes('parfait')) {
          nextTaskParameters = { ...nextTaskParameters, bloomsLevel: "Application et Analyse" };
        }
        nextStep = 4;
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: HARDCODED_SEQUENCE[8].content, timestamp: new Date() }];
        break;
      case 4:
        nextStep = 5;
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: HARDCODED_SEQUENCE[10].content, timestamp: new Date() }];
        shouldShowExam = true;
        break;
      case 5:
        nextStep = 6;
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: HARDCODED_SEQUENCE[12].content, timestamp: new Date() }];
        shouldUpdateExam = true;
        break;
      default:
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: "Voulez-vous modifier autre chose ?", timestamp: new Date() }];
        break;
    }

    setStep(nextStep);
    setMessages(prev => [...prev, ...nextMessages]);
    setTaskParameters(nextTaskParameters);
    
    if (shouldShowExam) {
      setShowExam(true);
    }
    
    if (shouldUpdateExam) {
      // Fixed line with syntax error
      EXAM_ARTIFACT.questions[1].text = "Expliquez brièvement la différence entre une cellule animale et une cellule végétale en vous concentrant sur trois organites spécifiques.";
      EXAM_ARTIFACT.questions[1].difficulty = "Moyen";
      EXAM_ARTIFACT.questions[1].type = "Application";
    }
  };

  const copyToClipboard = () => {
    const exam = EXAM_ARTIFACT;
    const text = `${exam.title}\n${exam.course}\nDurée : ${exam.duration}\nConsignes : ${exam.instructions}\n\n${exam.questions.map((q, i) => `${i+1}. [${q.type} - ${q.points} pts] ${q.text}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Contenu copié", description: "L'examen a été copié dans le presse-papiers." });
  };

  const downloadAsText = () => {
    const exam = EXAM_ARTIFACT;
    const textBlob = new Blob([`${exam.title}\n${exam.course}\nDurée : ${exam.duration}\nConsignes : ${exam.instructions}\n\n${exam.questions.map((q, i) => `${i+1}. [${q.type} - ${q.points} pts] ${q.text}`).join('\n\n')}`], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(textBlob);
    link.download = `${exam.course.replace(/\s+/g,'-').toLowerCase()}-examen.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Examen téléchargé", description: "L'examen a été téléchargé." });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar with task parameters */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="sticky top-8">
              <CardHeader><CardTitle>Paramètres de la tâche</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(taskParameters).map(([key, value]) => (
                  <div key={key}> 
                    <h3 className="font-medium text-sm text-gray-500">{key.toUpperCase()}</h3>
                    <p className="font-medium">{value || 'Non spécifié'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Agent moved to below sidebar */}
            <div className="mt-2">
              <AgentCall name={currentAgent} />
            </div>
          </div>
          
          {/* Chat area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="flex flex-col h-[600px]">
              <CardHeader className="border-b pb-4"><CardTitle>Discuter avec l'assistant IA</CardTitle></CardHeader>
              <CardContent className="flex-grow overflow-auto p-4">
                <div className="flex flex-col space-y-4">
                  {messages.map(m => (
                    <div key={m.id} className={cn('flex w-max max-w-[80%] rounded-lg px-4 py-2', m.role === 'user' ? 'ml-auto bg-ergi-primary text-white' : 'bg-gray-100')}> 
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    </div>
                  ))}
                  {showThinkingBubble && thinkingStep && (
                    <div className="flex w-max max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 animate-pulse">
                      <span className="text-indigo-700">{thinkingStep}</span>
                    </div>
                  )}
                  {isGenerating && !thinkingStep && (
                    <div className="flex w-max max-w-[80%] rounded-lg px-4 py-2 bg-gray-100">...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex items-center space-x-2">
                <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Tapez votre message..." onKeyDown={e => e.key==='Enter' && handleSendMessage()} />
                <Button onClick={handleSendMessage} disabled={isGenerating || !input.trim()}
                  className="bg-ergi-primary hover:bg-ergi-dark">
                  {isGenerating ? 'Envoi...' : <>Envoyer <Send className="h-4 w-4 ml-2"/></>}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Generated exam display */}
            {showExam && (
              <Card>
                <CardHeader><CardTitle>Examen généré</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <h2 className="text-xl font-bold">{EXAM_ARTIFACT.title}</h2>
                  <p className="text-gray-600">{EXAM_ARTIFACT.course}</p>
                  <p className="text-gray-600">Durée : {EXAM_ARTIFACT.duration}</p>
                  <p className="font-medium">Consignes : {EXAM_ARTIFACT.instructions}</p>
                  <div className="space-y-6 mt-4">
                    {EXAM_ARTIFACT.questions.map((q, i) => (
                      <div key={q.id} className="border-l-4 border-ergi-primary pl-4 py-2">
                        <div className="flex justify-between">
                          <h3 className="font-bold">Question {i+1} ({q.points} pts)</h3>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">{q.type} | {q.difficulty}</span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap">{q.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-2"/>Copier</Button>
                  <Button variant="outline" onClick={downloadAsText}><Download className="h-4 w-4 mr-2"/>Télécharger</Button>
                  <Button className="bg-ergi-primary hover:bg-ergi-dark"><ArrowRight className="h-4 w-4 mr-2"/>Continuer l'édition</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;