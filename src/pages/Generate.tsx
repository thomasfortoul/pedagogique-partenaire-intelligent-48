import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom'; // Import useParams
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
import { Course } from '@/types/course'; // Import Course type
import { UserProfile } from '@/types/user'; // Import UserProfile type

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

// --- Configuration ---
const BASE_URL = "http://localhost:8000";
const AGENT_NAME = "multi_tool_agent"; // As per chat_setup/chat_client.py
// --- End Configuration ---

const Generate = () => {
  const { courseId } = useParams<{ courseId?: string }>(); // Get courseId from URL
  const [step, setStep] = useState(0); // Still used for agent display logic
  const [currentAgent, setCurrentAgent] = useState<AgentData>(AGENTS_DATA[0]);
  const [messages, setMessages] = useState<any[]>([]); // Initialize as empty, will set initial message in useEffect
  const [input, setInput] = useState('');
  const [userId] = useState(() => `user_${uuidv4()}`); // Generate once on component mount
  const [sessionId, setSessionId] = useState(() => `session_${uuidv4()}`); // Initialize with a unique ID
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExam, setShowExam] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<typeof EXAM_ARTIFACT_PLACEHOLDER | null>(null); // State for the generated exam
  const [taskParameters, setTaskParameters] = useState(initialTaskParameters);
  const [showThinkingBubble, setShowThinkingBubble] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]); // State to store all courses
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null); // State to store the specific course for generation
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State to store user profile data

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

  useEffect(() => {
    let initialMessageContent = "Bienvenue dans le Générateur d'examens!\nQue souhaitez-vous créer aujourd'hui?";
    if (courseId) {
      const foundCourse = courses.find(c => c.id === courseId); // Use loaded courses
      if (foundCourse) {
        setCurrentCourse(foundCourse); // Set the found course
        setTaskParameters(prev => ({ ...prev, course: foundCourse.title })); // Use foundCourse.title
        initialMessageContent = `Bienvenue dans le Générateur d'examens pour le cours de "${foundCourse.title}"!\nDescription du cours: ${foundCourse.description}\nQue souhaitez-vous créer aujourd'hui?`;
      } else {
        initialMessageContent = `Bienvenue dans le Générateur d'examens!\nLe cours avec l'ID "${courseId}" n'a pas été trouvé.\nQue souhaitez-vous créer aujourd'hui?`;
      }
    }
    // Construct UserProfile
    setUserProfile({
      userId: userId,
      courses: courses, // Pass all courses
      // Add other profile data if available, e.g., name, email
    });

    setMessages([
      { id: 'initial-message', role: 'system', content: initialMessageContent, timestamp: new Date() }
    ]);
  }, [courseId, courses, userId]); // Re-run when courseId, courses, or userId change



  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to create or reuse a session with the ADK agent
  const createSession = async () => {
    if (!sessionId) return; // Should not happen with the new initialization

    const url = `${BASE_URL}/apps/${AGENT_NAME}/users/${userId}/sessions/${sessionId}`;
    const headers = {"Content-Type": "application/json"};

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}) // No initial state for simplicity
      });

      if (response.status === 200) {
        console.log(`Session created successfully: ${sessionId} for user ${userId}`);
      } else if (response.status === 400 && (await response.text()).includes("Session already exists")) {
        console.log(`Session ${sessionId} for user ${userId} already exists. Reusing.`);
      } else {
        console.error(`Error creating session: ${response.status}`);
        console.error(await response.text());
        toast({
          title: "Session Error",
          description: `Failed to create or reuse session: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Network error creating session:", error);
      toast({
        title: "Network Error",
        description: `Could not connect to agent server: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    createSession();
  }, [sessionId, userId]); // Depend on sessionId and userId to ensure it runs if they change (though userId is stable)

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
    // The thinking step text will now be generic as dynamic steps are removed
    // setThinkingStep(THINKING_CHAT[Math.min(step + 1, THINKING_CHAT.length - 1)]); // Removed dynamic thinking step

    try {
      const url = `${BASE_URL}/run`; // Changed endpoint to ADK API server's /run
      const payload = {
        app_name: AGENT_NAME, // Use snake_case as required by ADK API
        user_id: userId,
        session_id: sessionId,
        new_message: {
          role: "user",
          parts: [{ text: newUserMessage.content }]
        },
        // Pass course and user profile data
        course_data: currentCourse ? {
          id: currentCourse.id,
          title: currentCourse.title,
          description: currentCourse.description,
          level: currentCourse.level,
          // documents: currentCourse.documents // Only include if needed by agent, can be large
        } : null,
        user_profile_data: userProfile,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send the new payload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get agent response');
      }

      const resultEvents = await response.json(); // Now expects an array of events from ADK API

      let agentResponseText = "";
      // Iterate through the events to find the final text response from the model
      for (const event of resultEvents) {
        if (event.content && event.content.parts) {
          for (const part of event.content.parts) {
            if (part.text) {
              agentResponseText += part.text;
            }
            // Optionally, you can add logic here to display function calls/responses
            // if (part.functionCall) {
            //   agentResponseText += `\n(Calling tool: ${part.functionCall.name} with args: ${JSON.stringify(part.functionCall.args)})`;
            // }
            // if (part.functionResponse) {
            //   agentResponseText += `\n(Tool response: ${part.functionResponse.name} - Status: ${part.functionResponse.response?.status || 'N/A'})`;
            // }
          }
        }
      }

      // Add agent's response to messages
      const agentResponse = {
        id: Date.now().toString() + '_agent',
        role: 'system',
        content: agentResponseText.trim() || "No text response from agent.", // Use the collected text
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, agentResponse]);

      // --- The following UI update logic is specific to the previous backend and is removed/commented out ---
      // It is assumed that the ADK API server does not provide these structured UI updates directly.
      // If this functionality is desired, an intermediary backend would be required.

      // if (result.session_id && result.session_id !== sessionId) {
      //   setSessionId(result.session_id);
      //   console.log("New session ID received:", result.session_id);
      // }
      // if (result.ui_updates) {
      //   console.log("Received UI updates:", result.ui_updates);
      //   if (result.ui_updates.taskParameters) {
      //     setTaskParameters(prev => ({ ...prev, ...result.ui_updates.taskParameters }));
      //   }
      //   if (result.ui_updates.generatedExam) {
      //       setGeneratedExam(result.ui_updates.generatedExam);
      //       setShowExam(true);
      //   }
      // }
      // if (result.ui_updates?.current_agent_id) {
      //     const agentIndex = AGENTS_DATA.findIndex(agent => agent.id === result.ui_updates.current_agent_id);
      //     if (agentIndex !== -1) {
      //         setStep(agentIndex);
      //     }
      // } else {
      //     setStep(prevStep => prevStep + 1);
      // }


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