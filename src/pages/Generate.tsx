import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Workflow,
  Target,
  BookOpen,
  Layers,
  MessageCircleQuestion,
  ClipboardEdit,
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

// Artifact representing the generated exam (placeholder structure)
// This will be populated by the backend response
const EXAM_ARTIFACT_PLACEHOLDER = {
  title: "Generated Exam",
  course: "",
  duration: "",
  instructions: "",
  questions: [] as any[], // Use 'any' for now, define a proper type later
};


// Initial parameters for the task sidebar
const initialTaskParameters = {
  course: '', // Start empty, will be filled by chat
  outputType: '', // Start empty, will be filled by chat
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
  const [step, setStep] = useState(0); // Still used for agent display logic
  const [currentAgent, setCurrentAgent] = useState<AgentData>(AGENTS_DATA[0]);
  const [messages, setMessages] = useState([
    { id: 'initial-message', role: 'system', content: "Bienvenue dans le Générateur d'examens pour Biologie introductive!\nQue souhaitez-vous créer aujourd'hui?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null); // State to hold the session ID
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<typeof EXAM_ARTIFACT_PLACEHOLDER | null>(null); // State for the generated exam
  const [taskParameters, setTaskParameters] = useState(initialTaskParameters);
  const [showThinkingBubble, setShowThinkingBubble] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // MDP State (kept for now, but chat will replace its functionality)
  const [mdpObjectivesInput, setMdpObjectivesInput] = useState('');
  const [mdpQuestionCountsInput, setMdpQuestionCountsInput] = useState('');
  const [mdpDifficultyInput, setMdpDifficultyInput] = useState('medium');
  const [isGeneratingMdpQuiz, setIsGeneratingMdpQuiz] = useState(false);
  const [mdpQuizResult, setMdpQuizResult] = useState(null);

  // MDP Handler (kept for now)
  const handleGenerateMdpQuiz = async () => {
    setIsGeneratingMdpQuiz(true);
    setMdpQuizResult(null); // Clear previous result

    // Parse objectives input (comma-separated text)
    const objectives = mdpObjectivesInput.split(',').map(obj => ({
        text: obj.trim(),
        // For MDP, assign a default Bloom level or handle in backend
        // Let's assign 'Understanding' for simplicity in the UI for now
        bloom_level: 'Understanding'
    })).filter(obj => obj.text); // Filter out empty objectives

    // Parse question counts input (type:count, ...)
    const questionCounts: Record<string, number> = {};
    mdpQuestionCountsInput.split(',').forEach(item => {
        const parts = item.trim().split(':');
        if (parts.length === 2) {
            const type = parts[0].trim();
            const count = parseInt(parts[1].trim(), 10);
            if (!isNaN(count) && count > 0) {
                questionCounts[type] = count;
            }
        }
    });

    if (objectives.length === 0 || Object.keys(questionCounts).length === 0) {
        toast({
            title: "Input Error",
            description: "Please provide at least one objective and one question count.",
            variant: "destructive"
        });
        setIsGeneratingMdpQuiz(false);
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/generate-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                objectives: objectives,
                question_counts: questionCounts,
                difficulty: mdpDifficultyInput || 'medium',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to generate quiz');
        }

        const result = await response.json();
        setMdpQuizResult(result);
        toast({
            title: "Quiz Generated",
            description: "The MDP quiz has been generated successfully.",
        });

    } catch (error: any) {
        console.error("Error generating MDP quiz:", error);
        toast({
            title: "Generation Failed",
            description: `Error: ${error.message}`,
            variant: "destructive"
        });
    } finally {
        setIsGeneratingMdpQuiz(false);
    }
  };


  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // This effect now primarily controls the agent display based on the step
    const idx = Math.min(step, AGENTS_DATA.length - 1);
    setCurrentAgent(AGENTS_DATA[idx]);
  }, [step]);

  const handleSendMessage = async () => { // Made async
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
    // The thinking step text might need to be dynamic based on backend response later
    setThinkingStep(THINKING_CHAT[Math.min(step + 1, THINKING_CHAT.length - 1)]); // Keep for initial visual feedback

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId, // Include session ID in the request
          message: newUserMessage.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get agent response');
      }

      const result = await response.json();

      // Update session ID if a new one is returned
      if (result.session_id && result.session_id !== sessionId) {
        setSessionId(result.session_id);
        console.log("New session ID received:", result.session_id);
      }

      // Add agent's response to messages
      const agentResponse = {
        id: Date.now().toString() + '_agent',
        role: 'system', // Assuming agent responses are 'system' messages
        content: result.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentResponse]);

      // Handle dynamic UI updates based on ui_updates data
      if (result.ui_updates) {
        console.log("Received UI updates:", result.ui_updates);
        // Example: Update task parameters
        if (result.ui_updates.taskParameters) {
          setTaskParameters(prev => ({ ...prev, ...result.ui_updates.taskParameters }));
        }
        // Example: Show generated exam
        if (result.ui_updates.generatedExam) {
            setGeneratedExam(result.ui_updates.generatedExam);
            setShowExam(true);
        }
        // TODO: Add logic for other potential UI updates
      }

      // Update step based on backend response if needed (e.g., for agent icon change)
      // The backend could return a 'next_step' or 'current_agent_id' in ui_updates
      if (result.ui_updates?.current_agent_id) {
          const agentIndex = AGENTS_DATA.findIndex(agent => agent.id === result.ui_updates.current_agent_id);
          if (agentIndex !== -1) {
              setStep(agentIndex);
          }
      } else {
          // Basic step increment if backend doesn't specify (might need refinement)
          setStep(prevStep => prevStep + 1);
      }


    } catch (error: any) {
      console.error("Error sending message to backend:", error);
      toast({
        title: "Communication Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
      // Add an error message to the chat
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_error',
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsGenerating(false);
      setShowThinkingBubble(false); // Hide thinking bubble regardless of specific text
      setThinkingStep(''); // Clear thinking text
    }
  };

  const copyToClipboard = () => {
    if (!generatedExam) return;
    const exam = generatedExam;
    const text = `${exam.title}\n${exam.course}\nDurée : ${exam.duration}\nConsignes : ${exam.instructions}\n\n${exam.questions.map((q: any, i: number) => `${i+1}. [${q.type} - ${q.points} pts] ${q.text}`).join('\n\n')}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Contenu copié", description: "L'examen a été copié dans le presse-papiers." });
  };

  const downloadAsText = () => {
    if (!generatedExam) return;
    const exam = generatedExam;
    const textBlob = new Blob([`${exam.title}\n${exam.course}\nDurée : ${exam.duration}\nConsignes : ${exam.instructions}\n\n${exam.questions.map((q: any, i: number) => `${i+1}. [${q.type} - ${q.points} pts] ${q.text}`).join('\n\n')}`], { type: 'text/plain' });
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
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24">
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
            <Card className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] shadow-xl">
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

            {/* MDP Quiz Generation Section */}
            <Card className="shadow-xl">
              <CardHeader><CardTitle className="text-lg">Generate MDP Quiz (Alpha)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Objectives (comma-separated text, e.g., "Understand concepts, Apply methods")</label>
                  <Input
                    value={mdpObjectivesInput}
                    onChange={e => setMdpObjectivesInput(e.target.value)}
                    placeholder="Enter objectives"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question Counts (e.g., mcq:5, true_false:3)</label>
                   <Input
                    value={mdpQuestionCountsInput}
                    onChange={e => setMdpQuestionCountsInput(e.target.value)}
                    placeholder="Enter question counts (type:count, ...)"
                    className="mt-1"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                   <Input
                    value={mdpDifficultyInput}
                    onChange={e => setMdpDifficultyInput(e.target.value)}
                    placeholder="e.g., medium"
                    className="mt-1"
                  />
                </div>

                {mdpQuizResult && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Generated Quiz:</h3>
                    <p>Title: {mdpQuizResult.title}</p>
                    <p>Description: {mdpQuizResult.description}</p>
                    <p>Total Questions: {mdpQuizResult.metadata.question_count}</p>
                    <div className="space-y-4 mt-4">
                      {mdpQuizResult.questions.map((q: any, index: number) => (
                         <div key={q.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-md">
                            <p className="font-medium">Q{index + 1}: {q.text}</p>
                            <p className="text-sm text-gray-600">Type: {q.type}, Bloom Level: {q.bloom_level}, Difficulty: {q.difficulty}</p>
                            {q.options && (
                                <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                                    {q.options.map((opt: any) => (
                                        <li key={opt.id}>{opt.id}: {opt.text}</li>
                                    ))}
                                </ul>
                            )}
                         </div>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
              <CardFooter className="border-t p-4 flex justify-end">
                <Button
                  onClick={handleGenerateMdpQuiz}
                  disabled={isGeneratingMdpQuiz}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isGeneratingMdpQuiz ? (
                     <>
                       <motion.div
                         animate={{ rotate: 360 }}
                         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                         className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                       Generating...
                     </>
                   ) : (
                     "Generate Quiz"
                   )}
                </Button>
              </CardFooter>
            </Card>

            {showExam && generatedExam && (
              <motion.div initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y:0 }} transition={{duration: 0.5}}>
                <Card className="shadow-xl">
                  <CardHeader><CardTitle className="text-lg">Generated Exam</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-md">{generatedExam.title}</h3>
                      <p className="text-sm text-gray-600">{generatedExam.course}</p>
                      <p className="text-sm text-gray-600">Duration: {generatedExam.duration}</p>
                      <p className="text-sm text-gray-600">Instructions: {generatedExam.instructions}</p>
                    </div>
                    <div className="space-y-4">
                      {generatedExam.questions.map((q: any, i: number) => (
                        <div key={q.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-md">
                          <p className="font-medium">Q{i + 1}: {q.text}</p>
                          <p className="text-sm text-gray-600">Type: {q.type}, Points: {q.points}, Difficulty: {q.difficulty}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button onClick={copyToClipboard} variant="outline" className="flex items-center">
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </Button>
                    <Button onClick={downloadAsText} className="flex items-center bg-ergi-primary hover:bg-ergi-dark">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
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