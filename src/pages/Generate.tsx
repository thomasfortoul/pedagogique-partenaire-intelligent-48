import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import {
  Send,
  Copy,
  Download,
  ArrowRight,
  // MessageSquare, // Not used directly anymore, specific icons are used for agents
  Workflow,       // Icon for Agent Principal
  Target,         // Icon for Agent Objectifs
  BookOpen,       // Icon for Agent Pédagogie
  Layers,         // Icon for Agent Bloom
  MessageCircleQuestion, // Icon for Agent Questions
  ClipboardEdit,  // Icon for Agent Créateur d'Examen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface for Agent Data
interface AgentData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
}

// Data for each agent in the workflow including icons and descriptions
const AGENTS_DATA: AgentData[] = [
  {
    id: 'principal',
    name: 'Agent Principal',
    icon: <Workflow size={32} className="text-indigo-500" />,
    description: "Coordonne la tâche et l'équipe.",
  },
  {
    id: 'objectifs',
    name: 'Agent Objectifs',
    icon: <Target size={32} className="text-teal-500" />,
    description: "Expert en définition d'objectifs pédagogiques.",
  },
  {
    id: 'pedagogie',
    name: 'Agent Pédagogie',
    icon: <BookOpen size={32} className="text-blue-500" />,
    description: 'Spécialiste des approches et stratégies didactiques.',
  },
  {
    id: 'bloom',
    name: 'Agent Bloom',
    icon: <Layers size={32} className="text-purple-500" />,
    description: 'Maître de la taxonomie de Bloom et des niveaux cognitifs.',
  },
  {
    id: 'questions',
    name: 'Agent Questions',
    icon: <MessageCircleQuestion size={32} className="text-orange-500" />,
    description: 'Concepteur de questions pertinentes et évaluatives.',
  },
  {
    id: 'createur',
    name: "Agent Créateur d'Examen",
    icon: <ClipboardEdit size={32} className="text-red-500" />,
    description: "Assembleur final de l'examen structuré.",
  },
];

type AgentCallProps = { agent: AgentData };

function AgentCall({ agent }: AgentCallProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }}
      exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }}
      className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg text-center min-h-[150px] border border-gray-200"
    >
      <div className="mb-3 transform transition-transform duration-300 group-hover:scale-110">
        {agent.icon}
      </div>
      <h3 className="font-semibold text-md mb-1 text-gray-800">{agent.name}</h3>
      <p className="text-xs text-gray-500 px-2">{agent.description}</p>
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

const sidebarHeaderMapping = {
  course: "Cours",
  outputType: "Type de Document",
  learningObjectives: "Objectifs d'Apprentissage",
  bloomsLevel: "Niveau de Bloom"
};

// Chat thinking bubble texts - aligned with AGENTS_DATA flow
const THINKING_CHAT = [
  "Préparation de l'environnement...", // Initial step 0
  "Analyse de la demande par l'Agent Principal...", // After user input for step 0 -> agent 0
  "Définition des objectifs par l'Agent Objectifs...", // After user input for step 1 -> agent 1
  "Consultation de l'Agent Pédagogie...", // After user input for step 2 -> agent 2
  "Évaluation du niveau par l'Agent Bloom...", // After user input for step 3 -> agent 3
  "Génération des questions par l'Agent Questions...", // After user input for step 4 -> agent 4
  "Compilation de l'examen par l'Agent Créateur...", // After user input for step 5 -> agent 5
  "Finalisation et prêt pour modifications..." // Default/Final step
];

const Generate = () => {
  const [step, setStep] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<AgentData>(AGENTS_DATA[0]);
  const [messages, setMessages] = useState([
    { id: '0', role: 'system', content: HARDCODED_SEQUENCE[0].content, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [taskParameters, setTaskParameters] = useState(initialTaskParameters);
  const [showThinkingBubble, setShowThinkingBubble] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const idx = Math.min(step, AGENTS_DATA.length - 1);
    setCurrentAgent(AGENTS_DATA[idx]);
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
    // Use step for current agent, step + 1 for the agent *processing* this input
    setThinkingStep(THINKING_CHAT[Math.min(step + 1, THINKING_CHAT.length - 1)]);

    setTimeout(() => {
      setThinkingStep(''); // This will trigger the "..." via the render logic below
      setTimeout(() => {
        setShowThinkingBubble(false);
        handleBotResponse(newUserMessage.content);
        setIsGenerating(false);
      }, 1500); // Increased duration for "..."
    }, 1500); // Increased duration for specific thinking message
  };

  const handleBotResponse = (userInput: string) => {
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
      case 5: // Corresponds to "Agent Créateur d'Examen"
        nextStep = 6; // To show a final message or allow further edits
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: HARDCODED_SEQUENCE[12].content, timestamp: new Date() }];
        shouldUpdateExam = true;
        break;
      default: // Step 6 or more
        nextMessages = [{ id: Date.now().toString(), role: 'system', content: "Voulez-vous modifier autre chose ?", timestamp: new Date() }];
        break;
    }

    setStep(nextStep);
    setMessages(prev => [...prev, ...nextMessages]);
    setTaskParameters(nextTaskParameters);
    
    if (shouldShowExam) setShowExam(true);
    
    if (shouldUpdateExam) {
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sidebar with task parameters & Agent display */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24"> {/* Added sticky top */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Paramètres de la Tâche</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(taskParameters).map(([key, value]) => (
                  <div key={key}> 
                    <h3 className="font-medium text-sm text-gray-500">
                      {sidebarHeaderMapping[key as keyof typeof sidebarHeaderMapping] || key.charAt(0).toUpperCase() + key.slice(1)}
                    </h3>
                    <p className="font-semibold text-gray-700">{value || <span className="italic text-gray-400">Non spécifié</span>}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <div className="mt-2"> {/* Agent display area */}
              <AnimatePresence mode="wait">
                {/* The key here is crucial for AnimatePresence */}
                <AgentCall key={currentAgent.id} agent={currentAgent} />
              </AnimatePresence>
            </div>
          </div>
          
          {/* Chat area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] shadow-xl"> {/* Adjusted height */}
              <CardHeader className="border-b pb-4"><CardTitle className="text-lg">Discuter avec l'Assistant IA</CardTitle></CardHeader>
              <CardContent className="flex-grow overflow-auto p-4 space-y-4">
                  {messages.map(m => (
                    <div key={m.id} className={cn(
                      'flex w-max max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm', 
                      m.role === 'user' 
                        ? 'ml-auto bg-ergi-primary text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    )}> 
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    </div>
                  ))}
                  {showThinkingBubble && thinkingStep && (
                    <div className="flex w-max max-w-[85%] rounded-xl px-4 py-3 bg-gray-100 border border-gray-200 shadow-sm animate-pulse">
                      <span className="text-indigo-600 text-sm italic">{thinkingStep}</span>
                    </div>
                  )}
                  {isGenerating && !thinkingStep && showThinkingBubble && ( // Shows "..." when thinkingStep is cleared
                    <div className="flex items-center w-max max-w-[85%] rounded-xl px-4 py-3 bg-gray-100 border border-gray-200 shadow-sm">
                      <span className="text-sm text-gray-500 italic">Réflexion</span>
                      <motion.div className="flex space-x-1 ml-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animation-delay-200"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animation-delay-400"></div>
                      </motion.div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
              </CardContent>
              <CardFooter className="border-t p-4 flex items-center space-x-3">
                <Input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Posez une question ou donnez une instruction..." 
                  onKeyDown={e => e.key==='Enter' && !isGenerating && handleSendMessage()} 
                  className="flex-grow"
                  disabled={isGenerating}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isGenerating || !input.trim()}
                  className="bg-ergi-primary hover:bg-ergi-dark px-5 py-2.5"
                >
                  {isGenerating ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                       />
                      Envoi...
                    </>
                  ) : (
                    <>Envoyer <Send className="h-4 w-4 ml-2"/></>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {showExam && (
              <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{duration: 0.5}}>
                <Card className="shadow-xl">
                  <CardHeader><CardTitle className="text-lg">Examen Généré</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <h2 className="text-xl font-bold text-ergi-primary">{EXAM_ARTIFACT.title}</h2>
                    <p className="text-gray-600">{EXAM_ARTIFACT.course}</p>
                    <p className="text-sm text-gray-500">Durée : {EXAM_ARTIFACT.duration}</p>
                    <p className="font-medium text-gray-700">Consignes : <span className="font-normal">{EXAM_ARTIFACT.instructions}</span></p>
                    <div className="space-y-6 mt-6">
                      {EXAM_ARTIFACT.questions.map((q, i) => (
                        <div key={q.id} className="border-l-4 border-ergi-primary pl-4 py-3 bg-white rounded-r-md shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-gray-800">Question {i+1} <span className="font-normal text-gray-600">({q.points} pts)</span></h3>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">{q.type} | {q.difficulty}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{q.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" onClick={copyToClipboard}><Copy className="h-4 w-4 mr-2"/>Copier</Button>
                    <Button variant="outline" onClick={downloadAsText}><Download className="h-4 w-4 mr-2"/>Télécharger</Button>
                    <Button className="bg-ergi-primary hover:bg-ergi-dark"><ArrowRight className="h-4 w-4 mr-2"/>Continuer l'édition</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;