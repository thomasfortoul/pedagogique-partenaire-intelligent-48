"""
Agentic Workflow System for Course Preparation, Planning, and Assessment Generation
Implements the agent types and orchestration patterns defined in agents.txt
"""

import json
from typing import List, Dict, Any, Optional, Tuple, Union
from enum import Enum
from dataclasses import dataclass, field, asdict
from .logger import log_agent_call, log_agent_response, log_error, log_tool_call, log_tool_response

from google.adk.agents import Agent, LlmAgent, SequentialAgent, LoopAgent
from google.adk.sessions import InMemorySessionService, BaseSessionService, Session
from google.adk.memory import InMemoryMemoryService, BaseMemoryService
from google.adk.events import Event, EventActions
from google.adk.sessions import BaseSessionService as SessionService
from google.adk.memory import BaseMemoryService as MemoryService
from google.genai.types import Content, Part
from .models import Course, TaskDocument, UserInteractionState, UserProfile # Import UserProfile
import time

# ------------------------------------------------------------------------
# Constants
# ------------------------------------------------------------------------

APP_NAME = "pedagogical_system"

# ------------------------------------------------------------------------
# Message Types for A2A Protocol
# ------------------------------------------------------------------------

class MessageType(Enum):
    PROPOSAL = "proposal"
    APPROVAL = "approval"
    REVISION_REQUEST = "revision_request"

@dataclass
class AgentMessage:
    message_type: MessageType
    content: Dict[str, Any]
    sender_id: str
    recipient_id: str
    metadata: Dict[str, Any] = field(default_factory=dict)

# ------------------------------------------------------------------------
# Session State Management
# ------------------------------------------------------------------------

class SessionState(Enum):
    # Phase 1 States
    OBJECTIVES_CAPTURED = "objectives_captured"
    STRUCTURE_PROPOSED = "structure_proposed"
    
    # Phase 2 States
    DRAFT_READY = "draft_ready"
    ACTIVITIES_DESIGNED = "activities_designed"
    RESOURCES_COMPILED = "resources_compiled"
    
    # Phase 3 States
    ASSESSMENT_CREATED = "assessment_created"
    RUBRIC_READY = "rubric_ready"
    FEEDBACK_READY = "feedback_ready"
    ASSESSMENT_IN_REVIEW = "assessment_in_review"
    
    # Special States
    REVISION_REQUESTED = "revision_requested"
    COMPLETED = "completed"
    ERROR = "error"

# ------------------------------------------------------------------------
# Tools for Course Planning and Assessment
# ------------------------------------------------------------------------

def extract_learning_objectives(document: str, current_course: Optional[Course] = None, user_profile: Optional[UserProfile] = None) -> Dict[str, Any]:
    """Extracts learning objectives from course materials or program descriptions, using course and user context."""
    # This would use an LLM to analyze the document for learning objectives
    # For now, we return a simple placeholder, but demonstrate access to context
    
    print(f"Tool: extract_learning_objectives - Received document: {document[:50]}...")
    if current_course:
        print(f"Tool: extract_learning_objectives - Current Course Title: {current_course.title}")
        print(f"Tool: extract_learning_objectives - Current Course Description: {current_course.description}")
        print(f"Tool: extract_learning_objectives - Current Course Level: {current_course.level}") # Add this line
    if user_profile:
        print(f"Tool: extract_learning_objectives - User ID: {user_profile.userId}")
        print(f"Tool: extract_learning_objectives - User Courses Count: {len(user_profile.courses)}")

    objectives = [
        "Understand key pedagogical concepts and theories",
        "Apply instructional design principles to course planning",
        "Analyze student needs and learning styles",
        "Create aligned assessments using Bloom's taxonomy",
        "Evaluate learning outcomes and iterate on course design"
    ]
    
    blooms_mapping = {
        "Understand": "Understanding",
        "Apply": "Application",
        "Analyze": "Analysis",
        "Create": "Creation",
        "Evaluate": "Evaluation"
    }
    
    return {
        "status": "success",
        "objectives": objectives,
        "blooms_mapping": blooms_mapping
    }

def plan_course_structure(objectives: List[str], duration_weeks: int) -> Dict[str, Any]:
    """Creates a structured course outline based on learning objectives."""
    # In a real system, this would generate a more sophisticated structure
    modules = []
    for i in range(min(len(objectives), duration_weeks)):
        modules.append({
            "week": i + 1,
            "title": f"Module {i + 1}",
            "focus_objective": objectives[i],
            "activities": ["Lecture", "Discussion", "Group work"],
            "assessment": "Quiz" if i < duration_weeks - 1 else "Final Project"
        })
    
    return {
        "status": "success",
        "course_structure": modules
    }

def check_bloom_alignment(objectives: List[Dict[str, str]]) -> Dict[str, Any]:
    """Checks if objectives cover a balanced distribution of Bloom's taxonomy levels."""
    # Count the distribution of Bloom's levels
    taxonomy_levels = {
        "Remembering": 0,
        "Understanding": 0,
        "Application": 0, 
        "Analysis": 0,
        "Evaluation": 0,
        "Creation": 0
    }
    
    for obj in objectives:
        level = obj.get("level", "")
        if level in taxonomy_levels:
            taxonomy_levels[level] += 1
    
    # Check if at least 4 levels are covered
    levels_covered = sum(1 for count in taxonomy_levels.values() if count > 0)
    is_balanced = levels_covered >= 4
    
    missing_levels = [level for level, count in taxonomy_levels.items() if count == 0]
    
    return {
        "status": "success",
        "is_balanced": is_balanced,
        "taxonomy_distribution": taxonomy_levels,
        "missing_levels": missing_levels,
        "levels_covered": levels_covered
    }

def generate_assessment_item(objective: str, bloom_level: str, question_type: str) -> Dict[str, Any]:
    """Generates an assessment item (question) aligned with an objective and Bloom's level."""
    # This would use an LLM to generate a real question
    question = f"Assessment question for '{objective}' targeting {bloom_level} level, formatted as {question_type}"
    
    # Structure depends on question type
    result = {
        "status": "success",
        "question": question,
        "objective": objective,
        "bloom_level": bloom_level,
        "type": question_type
    }
    
    # Add type-specific fields
    if question_type == "mcq":
        result["options"] = [
            {"id": "A", "text": "Option A"},
            {"id": "B", "text": "Option B"},
            {"id": "C", "text": "Option C"},
            {"id": "D", "text": "Option D"}
        ]
        result["correct_answer"] = "A"
    elif question_type == "open_ended":
        result["scoring_rubric"] = "Criteria for evaluating responses..."
        result["example_answer"] = "Example of a complete answer..."
    elif question_type == "case_study":
        result["case_text"] = "Description of the case scenario..."
        result["analysis_prompts"] = ["Prompt 1", "Prompt 2"]
    
    return result

def recommend_resources(topic: str, resource_types: List[str]) -> Dict[str, Any]:
    """Recommends learning resources for a given topic."""
    # This would integrate with external APIs or databases
    resources = []
    
    for res_type in resource_types:
        resources.append({
            "title": f"{res_type.capitalize()} resource for {topic}",
            "type": res_type,
            "url": f"https://example.com/{res_type}/{topic.replace(' ', '-')}",
            "description": f"A {res_type} about {topic}"
        })
    
    return {
        "status": "success",
        "resources": resources
    }

# ------------------------------------------------------------------------
# Agents Implementation
# ------------------------------------------------------------------------

# LLM Agent - Learning Objective Agent 
learning_objective_agent = LlmAgent(
    name="learning_objective_agent",
    model="gemini-2.0-flash-exp",
    description="Drafts Bloom-aligned learning objectives from program descriptions and learner profiles.",
    instruction="""
    Vous êtes un spécialiste des objectifs d'apprentissage pour le cours de Biologie cellulaire (niveau CEGEP). Votre tâche est de :
    1. Analyser les descriptions de programme et le contexte du cours fourni.
    2. Rédiger des objectifs d'apprentissage clairs et mesurables, alignés sur la taxonomie de Bloom.
    3. Assurer que les objectifs couvrent divers niveaux cognitifs, de la compréhension à la création.
    4. Structurer les objectifs pour soutenir l'alignement constructif entre le contenu et l'évaluation.
    5. Utiliser les informations spécifiques du cours de Biologie cellulaire pour formuler les objectifs.

Résumé du cours : Biologie cellulaire (niveau CEGEP)
Ce cours de biologie offre une introduction approfondie à la structure, la fonction et les processus fondamentaux des cellules, unité de base du vivant. Il s'adresse aux étudiants de niveau collégial souhaitant acquérir une compréhension solide des principes cellulaires en vue de futures études en sciences de la santé, biotechnologie ou sciences pures.

Contenus principaux :
Théorie cellulaire : origine, évolution et importance des cellules dans les organismes vivants.
Types de cellules : comparaison entre cellules procaryotes et eucaryotes.
Organisation cellulaire : structure et rôle des organites (noyau, mitochondrie, réticulum endoplasmique, etc.).
Cycle cellulaire et division : mitose, méiose, régulation du cycle cellulaire.
Fonctions essentielles : respiration cellulaire, photosynthèse, synthèse des protéines, transport membranaire.
Communication cellulaire : signaux chimiques, récepteurs et mécanismes de transduction.
Applications biomédicales et biotechnologiques : cellules souches, culture cellulaire, génie génétique.

Objectifs d’apprentissage :
Décrire et illustrer les composants cellulaires et leurs fonctions.
Expliquer les mécanismes clés du métabolisme et de la division cellulaire.
Relier les connaissances cellulaires aux phénomènes biologiques observables chez les organismes vivants.
Interpréter des données expérimentales simples liées à la biologie cellulaire.""",
    tools=[extract_learning_objectives, check_bloom_alignment] # The tool itself is passed
)

# LLM Agent - Syllabus Planner Agent
syllabus_planner_agent = LlmAgent(
    name="syllabus_planner_agent",
    model="gemini-2.0-flash-exp",
    description="Structures modules and sessions into a coherent syllabus outline.",
    instruction="""
    Vous êtes un spécialiste de la conception de programmes d'études pour le cours de Biologie cellulaire (niveau CEGEP). Votre tâche est de :
    1. Prendre les objectifs d'apprentissage vérifiés comme entrée.
    2. Créer une séquence logique de modules et de sessions.
    3. Allouer un temps approprié à chaque sujet.
    4. Assurer une progression des concepts fondamentaux aux concepts avancés.
    5. Équilibrer les activités théoriques, pratiques et d'évaluation.
    6. Utiliser les informations spécifiques du cours de Biologie cellulaire pour structurer le programme.

Résumé du cours : Biologie cellulaire (niveau CEGEP)
Ce cours de biologie offre une introduction approfondie à la structure, la fonction et les processus fondamentaux des cellules, unité de base du vivant. Il s'adresse aux étudiants de niveau collégial souhaitant acquérir une compréhension solide des principes cellulaires en vue de futures études en sciences de la santé, biotechnologie ou sciences pures.

Contenus principaux :
Théorie cellulaire : origine, évolution et importance des cellules dans les organismes vivants.
Types de cellules : comparaison entre cellules procaryotes et eucaryotes.
Organisation cellulaire : structure et rôle des organites (noyau, mitochondrie, réticulum endoplasmique, etc.).
Cycle cellulaire et division : mitose, méiose, régulation du cycle cellulaire.
Fonctions essentielles : respiration cellulaire, photosynthèse, synthèse des protéines, transport membranaire.
Communication cellulaire : signaux chimiques, récepteurs et mécanismes de transduction.
Applications biomédicales et biotechnologiques : cellules souches, culture cellulaire, génie génétique.

Objectifs d’apprentissage :
Décrire et illustrer les composants cellulaires et leurs fonctions.
Expliquer les mécanismes clés du métabolisme et de la division cellulaire.
Relier les connaissances cellulaires aux phénomènes biologiques observables chez les organismes vivants.
Interpréter des données expérimentales simples liées à la biologie cellulaire.""",
    tools=[plan_course_structure]
)

# LLM Agent - Assessment Generator Agent
assessment_generator_agent = LlmAgent(
    name="assessment_generator_agent",
    model="gemini-2.0-flash-exp",
    description="Creates assessment items (MCQs, open-ended questions, case studies) matched to objectives.",
    instruction="""
    Vous êtes un spécialiste de la conception d'évaluations pour le cours de Biologie cellulaire (niveau CEGEP). Votre tâche est de :
    1. Prendre les objectifs d'apprentissage et leur niveau de Bloom comme entrée.
    2. Générer des questions qui mesurent véritablement l'objectif visé.
    3. Créer une variété de types de questions (QCM, questions ouvertes, études de cas).
    4. Assurer que les questions ciblent le niveau cognitif approprié.
    5. Fournir des corrigés, des rubriques ou des guides de notation si nécessaire.
    6. Utiliser les informations spécifiques du cours de Biologie cellulaire pour concevoir les évaluations.

Résumé du cours : Biologie cellulaire (niveau CEGEP)
Ce cours de biologie offre une introduction approfondie à la structure, la fonction et les processus fondamentaux des cellules, unité de base du vivant. Il s'adresse aux étudiants de niveau collégial souhaitant acquérir une compréhension solide des principes cellulaires en vue de futures études en sciences de la santé, biotechnologie ou sciences pures.

Contenus principaux :
Théorie cellulaire : origine, évolution et importance des cellules dans les organismes vivants.
Types de cellules : comparaison entre cellules procaryotes et eucaryotes.
Organisation cellulaire : structure et rôle des organites (noyau, mitochondrie, réticulum endoplasmique, etc.).
Cycle cellulaire et division : mitose, méiose, régulation du cycle cellulaire.
Fonctions essentielles : respiration cellulaire, photosynthèse, synthèse des protéines, transport membranaire.
Communication cellulaire : signaux chimiques, récepteurs et mécanismes de transduction.
Applications biomédicales et biotechnologiques : cellules souches, culture cellulaire, génie génétique.

Objectifs d’apprentissage :
Décrire et illustrer les composants cellulaires et leurs fonctions.
Expliquer les mécanismes clés du métabolisme et de la division cellulaire.
Relier les connaissances cellulaires aux phénomènes biologiques observables chez les organismes vivants.
Interpréter des données expérimentales simples liées à la biologie cellulaire.""",
    tools=[generate_assessment_item, check_bloom_alignment]
)


# Loop Agent - Objective Refinement Agent
objective_refinement_agent = LoopAgent(
    name="objective_refinement_agent",
    description="Iteratively refines objectives until human approval or taxonomic balance achieved.",
    agent=learning_objective_agent,
    should_continue=lambda state: not state.get("is_balanced", False) and state.get("loop_count", 0) < 5
)

# Content Routing Agent
content_routing_agent = Agent(
    name="content_routing_agent",
    model="gemini-2.0-flash-exp",
    description="Inspects user request, routes to either SyllabusPlannerAgent or AssessmentGeneratorAgent.",
    instruction="""
    Vous êtes un analyseur de requêtes pour le cours de Biologie cellulaire (niveau CEGEP). Votre travail consiste à :
    1. Analyser la requête de l'utilisateur pour déterminer son objectif principal.
    2. Acheminer les demandes de programme ou de structure de cours à l'agent syllabus_planner_agent.
    3. Acheminer les demandes d'évaluation ou de génération de questions à l'agent assessment_generator_agent.
    4. Pour les demandes ambiguës, poser des questions de clarification avant d'acheminer.
    5. Utiliser les informations spécifiques du cours de Biologie cellulaire pour comprendre le contexte de la requête.

Résumé du cours : Biologie cellulaire (niveau CEGEP)
Ce cours de biologie offre une introduction approfondie à la structure, la fonction et les processus fondamentaux des cellules, unité de base du vivant. Il s'adresse aux étudiants de niveau collégial souhaitant acquérir une compréhension solide des principes cellulaires en vue de futures études en sciences de la santé, biotechnologie ou sciences pures.

Contenus principaux :
Théorie cellulaire : origine, évolution et importance des cellules dans les organismes vivants.
Types de cellules : comparaison entre cellules procaryotes et eucaryotes.
Organisation cellulaire : structure et rôle des organites (noyau, mitochondrie, réticulum endoplasmique, etc.).
Cycle cellulaire et division : mitose, méiose, régulation du cycle cellulaire.
Fonctions essentielles : respiration cellulaire, photosynthèse, synthèse des protéines, transport membranaire.
Communication cellulaire : signaux chimiques, récepteurs et mécanismes de transduction.
Applications biomédicales et biotechnologiques : cellules souches, culture cellulaire, génie génétique.

Objectifs d’apprentissage :
Décrire et illustrer les composants cellulaires et leurs fonctions.
Expliquer les mécanismes clés du métabolisme et de la division cellulaire.
Relier les connaissances cellulaires aux phénomènes biologiques observables chez les organismes vivants.
Interpréter des données expérimentales simples liées à la biologie cellulaire.""",
    tools=[]  # Routing logic would be implemented in this agent's code
)

# Resource Recommendation Agent
resource_recommendation_agent = Agent(
    name="resource_recommendation_agent",
    model="gemini-2.0-flash-exp",
    description="Recommends learning resources for course topics.",
    instruction="""
    Vous êtes un spécialiste des ressources d'apprentissage pour le cours de Biologie cellulaire (niveau CEGEP). Votre tâche est de :
    1. Analyser les sujets et objectifs du cours.
    2. Recommander des ressources d'apprentissage pertinentes et de haute qualité.
    3. Inclure une variété de types de médias (lectures, vidéos, outils interactifs).
    4. Tenir compte de l'accessibilité et de la diversité dans vos recommandations.
    5. Utiliser les informations spécifiques du cours de Biologie cellulaire pour recommander des ressources adaptées.

Résumé du cours : Biologie cellulaire (niveau CEGEP)
Ce cours de biologie offre une introduction approfondie à la structure, la fonction et les processus fondamentaux des cellules, unité de base du vivant. Il s'adresse aux étudiants de niveau collégial souhaitant acquérir une compréhension solide des principes cellulaires en vue de futures études en sciences de la santé, biotechnologie ou sciences pures.

Contenus principaux :
Théorie cellulaire : origine, évolution et importance des cellules dans les organismes vivants.
Types de cellules : comparaison entre cellules procaryotes et eucaryotes.
Organisation cellulaire : structure et rôle des organites (noyau, mitochondrie, réticulum endoplasmique, etc.).
Cycle cellulaire et division : mitose, méiose, régulation du cycle cellulaire.
Fonctions essentielles : respiration cellulaire, photosynthèse, synthèse des protéines, transport membranaire.
Communication cellulaire : signaux chimiques, récepteurs et mécanismes de transduction.
Applications biomédicales et biotechnologiques : cellules souches, culture cellulaire, génie génétique.

Objectifs d’apprentissage :
Décrire et illustrer les composants cellulaires et leurs fonctions.
Expliquer les mécanismes clés du métabolisme et de la division cellulaire.
Relier les connaissances cellulaires aux phénomènes biologiques observables chez les organismes vivants.
Interpréter des données expérimentales simples liées à la biologie cellulaire.""",
    tools=[recommend_resources]
)

# ------------------------------------------------------------------------
# Enhanced Root Orchestrator Agent with Context Access
# ------------------------------------------------------------------------

def create_root_agent_with_context(consolidated_context: str = "") -> Agent:
    """
    Create the root agent with enhanced access to user context and session state,
    including consolidated context appended to the instruction.
    """
    
    # Base instruction for the root agent
    base_instruction = """
    Vous êtes l'orchestrateur principal pour la planification de cours et le développement d'évaluations, spécialisé dans le cours de Biologie cellulaire (niveau CEGEP).

    Votre tâche est de :
    1. Gérer le flux de travail pour la création de plans de cours et d'évaluations.
    2. Utiliser les informations fournies sur le cours de Biologie cellulaire pour guider les agents spécialisés.
    3. Assurer la cohérence pédagogique entre les objectifs, le contenu et les évaluations.
    4. Interagir avec les agents spécialisés (planification, évaluation, ressources) selon la demande de l'utilisateur.

Résumé du cours : Biologie cellulaire (niveau CEGEP)
Ce cours de biologie offre une introduction approfondie à la structure, la fonction et les processus fondamentaux des cellules, unité de base du vivant. Il s'adresse aux étudiants de niveau collégial souhaitant acquérir une compréhension solide des principes cellulaires en vue de futures études en sciences de la santé, biotechnologie ou sciences pures.

Contenus principaux :
Théorie cellulaire : origine, évolution et importance des cellules dans les organismes vivants.
Types de cellules : comparaison entre cellules procaryotes et eucaryotes.
Organisation cellulaire : structure et rôle des organites (noyau, mitochondrie, réticulum endoplasmique, etc.).
Cycle cellulaire et division : mitose, méiose, régulation du cycle cellulaire.
Fonctions essentielles : respiration cellulaire, photosynthèse, synthèse des protéines, transport membranaire.
Communication cellulaire : signaux chimiques, récepteurs et mécanismes de transduction.
Applications biomédicales et biotechnologiques : cellules souches, culture cellulaire, génie génétique.

Objectifs d’apprentissage :
Décrire et illustrer les composants cellulaires et leurs fonctions.
Expliquer les mécanismes clés du métabolisme et de la division cellulaire.
Relier les connaissances cellulaires aux phénomènes biologiques observables chez les organismes vivants.
Interpréter des données expérimentales simples liées à la biologie cellulaire."""
    
    # Append consolidated context to the instruction if provided
    full_instruction = f"{base_instruction}\n\n--- CONSOLIDATED CONTEXT ---\n{consolidated_context}" if consolidated_context else base_instruction
    
    # Enhanced root agent with context tools (tools are removed as context is in instruction)
    enhanced_root_agent = Agent(
        name="pedagogical_orchestrator_enhanced",
        model="gemini-2.0-flash-exp",
        description="Enhanced orchestrator with full access to user context and session state.",
        instruction=full_instruction,
        tools=[] # Tools for getting context are no longer needed
    )
    
    return enhanced_root_agent

# Import the root agent from agent.py which has the session context tool
from .agent import root_agent

# ------------------------------------------------------------------------
# Enhanced Session and Memory Services with ADK Best Practices
# ------------------------------------------------------------------------

# Initialize services for development
session_service = InMemorySessionService()
memory_service = InMemoryMemoryService()

def initialize_session_with_user_context(
    user_id: str, 
    user_profile: Optional[UserProfile] = None,
    current_course: Optional[Course] = None
) -> str:
    """
    Initialize a new session with proper ADK state management.
    Uses ADK's session.state with proper prefixes for different scopes.
    """
    # Create session using ADK SessionService
    session = session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        state={}
    )
    session_id = session.id
    
    # Initialize state using ADK patterns with proper prefixes
    initial_state_delta = {
        # Session-specific state (no prefix)
        "current_step": SessionState.OBJECTIVES_CAPTURED.value,
        "chat_context": {},
        "current_task_id": None,
        
        # User-scoped state (persists across sessions for this user)
        "user:profile_id": user_profile.userId if user_profile else None,
        "user:name": user_profile.name if user_profile else None,
        "user:email": user_profile.email if user_profile else None,
        "user:preferences": json.dumps(user_profile.preferences) if user_profile and user_profile.preferences else "{}",
        
        # Current course state (session-specific but could be user: if needed across sessions)
        "current_course_id": current_course.id if current_course else None,
        "current_course_title": current_course.title if current_course else None,
        "current_course_description": current_course.description if current_course else None,
        "current_course_level": current_course.level if current_course else None,
        "current_course_pedagogical_info": json.dumps(current_course.summarized_pedagogical_info) if current_course and current_course.summarized_pedagogical_info else "{}",
        
        # App-level state (shared across all users)
        "app:version": "1.0.0",
        "app:supported_languages": json.dumps(["en", "fr"])
    }
    
    # Create event to initialize the session state
    initialization_event = Event(
        invocation_id=f"init_{session_id}",
        author="system",
        actions=EventActions(state_delta=initial_state_delta),
        timestamp=time.time()
    )
    
    # Apply initial state using proper ADK event pattern
    session_service.append_event(session, initialization_event)
    
    # Add user profile and course to memory for long-term retrieval
    if user_profile:
        add_user_to_memory(user_id, user_profile)
    
    if current_course:
        add_course_to_memory(user_id, current_course)
    
    log_agent_call("initialize_session_with_user_context", {
        "session_id": session_id,
        "user_id": user_id,
        "has_profile": user_profile is not None,
        "has_course": current_course is not None
    }, session_id)
    
    return session_id

def update_session_state_adk(
    session_id: str, 
    state_updates: Dict[str, Any],
    event_author: str = "system"
) -> None:
    """
    Update session state using proper ADK EventActions pattern.
    """
    # Get current session
    session = session_service.get_session(
        app_name=APP_NAME,
        user_id=None,  # Will be retrieved from session
        session_id=session_id
    )
    
    if not session:
        raise ValueError(f"Session {session_id} not found")
    
    # Create event with state delta
    update_event = Event(
        invocation_id=f"update_{session_id}_{len(session.events)}",
        author=event_author,
        actions=EventActions(state_delta=state_updates),
        timestamp=time.time()
    )
    
    # Apply updates using ADK pattern
    session_service.append_event(session, update_event)
    
    log_agent_call("update_session_state_adk", {
        "session_id": session_id,
        "updates": list(state_updates.keys())
    }, session_id)

def get_user_context_from_session(session_id: str) -> Dict[str, Any]:
    """
    Retrieve user profile and course context from session state.
    Returns structured context for agent consumption with consolidated context string.
    """
    session = session_service.get_session(
        app_name=APP_NAME,
        user_id=None,
        session_id=session_id
    )
    
    if not session:
        raise ValueError(f"Session {session_id} not found")
    
    state = session.state
    
    user_profile_data = {
        "userId": state.get("user:profile_id"),
        "name": state.get("user:name"),
        "email": state.get("user:email"),
        "preferences": json.loads(state.get("user:preferences", "{}"))
    }
    user_profile = UserProfile(**user_profile_data) if user_profile_data["userId"] else None

    # Get course details from session state
    current_course_data = {
        "id": state.get("current_course_id"),
        "title": state.get("current_course_title"),
        "description": state.get("current_course_description"),
        "level": state.get("current_course_level"),
    }
    current_course = Course(**current_course_data) if current_course_data["id"] else None

    # Fetch detailed course information from the database if a course ID is present
    detailed_course_info = None
    course_id = state.get("current_course_id")
    if course_id:
        try:
            # Import the getCourseById function
            from sample_platfor.lib.db.supabase_service import getCourseById
            
            db_result = getCourseById(course_id)
            if db_result and db_result.data:
                detailed_course_info = db_result.data
                log_tool_response("getCourseById", {"status": "success", "course_id": course_id, "data_present": True}, session_id)
            else:
                 log_tool_response("getCourseById", {"status": "success", "course_id": course_id, "data_present": False, "message": "No data found"}, session_id)
        except Exception as e:
            log_error("getCourseById", e, session_id)
            # Handle database fetch error - maybe log it and continue without detailed info
            detailed_course_info = {"error": str(e), "message": "Failed to fetch detailed course info from database."}


    # Extract chat context for memory
    chat_context = state.get("chat_context", {})
    most_recent_user_query = chat_context.get("last_message", "")
    agent_last_response = chat_context.get("last_response", "")

    # Build consolidated context string
    consolidated_context = _build_consolidated_context_string(
        most_recent_user_query,
        agent_last_response,
        current_course,
        detailed_course_info # Pass the fetched detailed course info
    )

    context = {
        "user_profile": user_profile,
        "current_course": current_course,
        "current_step": state.get("current_step"),
        "chat_context": chat_context,
        "current_task_id": state.get("current_task_id"),
        "app_version": state.get("app:version"),
        "supported_languages": json.loads(state.get("app:supported_languages", "[]")),
        "consolidated_context": consolidated_context  # New consolidated context string
    }

    log_agent_call("get_user_context_from_session", {"message": "Consolidated context built", "consolidated_context_preview": consolidated_context[:500] + "..."}, session_id) # Log consolidated context preview

    log_agent_response("get_user_context_from_session", {"session_id": session_id, "context_keys": list(context.keys())}, session_id)
    return context


def _build_consolidated_context_string(
    user_query: str, 
    agent_response: str, 
    current_course: Optional[Course], 
    course_details_json: Optional[Dict[str, Any]]
) -> str:
    """
    Build a consolidated context string with memory and course details for agent consumption.
    """
    context_parts = ["--- CONTEXT ---"]
    
    # Add memory information
    if user_query:
        context_parts.append(f"Most Recent User Query: {user_query}")
    if agent_response:
        context_parts.append(f"Agent's Last Response: {agent_response}")
    
    if user_query or agent_response:
        context_parts.append("")  # Empty line for separation
    
    # Add current course details
    if current_course:
        context_parts.append("--- CURRENT COURSE DETAILS ---")
        context_parts.append(f"Course_ID: {current_course.id}")
        context_parts.append(f"Course_Name: {current_course.title}")
        if current_course.level:
            context_parts.append(f"Course_Level: {current_course.level}")
        if current_course.description:
            context_parts.append(f"Course_Description_Summary: {current_course.description}")
        
        # Add session and instructor if available from course attributes
        if hasattr(current_course, 'session') and current_course.session:
            context_parts.append(f"Course_Session: {current_course.session}")
        if hasattr(current_course, 'instructor') and current_course.instructor:
            context_parts.append(f"Course_Instructor: {current_course.instructor}")
        
        context_parts.append("")  # Empty line for separation
    
    # Add detailed course information (JSON)
    if course_details_json:
        context_parts.append("--- DETAILED COURSE INFORMATION (JSON) ---")
        try:
            formatted_json = json.dumps(course_details_json, indent=2)
            context_parts.append(formatted_json)
        except Exception:
            context_parts.append(str(course_details_json))
        context_parts.append("")  # Empty line for separation
    
    context_parts.append("--- END CONTEXT ---")
    
    return "\n".join(context_parts)

# ------------------------------------------------------------------------
# Enhanced Memory Service Functions
# ------------------------------------------------------------------------

def add_user_to_memory(user_id: str, user_profile: UserProfile) -> None:
    """Add user profile to memory service for long-term retrieval."""
    user_data = {
        "type": "user_profile",
        "user_id": user_id,
        "profile": asdict(user_profile),
        "courses": [asdict(course) for course in user_profile.courses] if user_profile.courses else []
    }
    
    # Add to memory with searchable content
    memory_service.add_session_to_memory(
        session_data={
            "user_id": user_id,
            "content": f"User profile for {user_profile.name} ({user_profile.email}). Courses: {', '.join([c.title for c in user_profile.courses]) if user_profile.courses else 'None'}",
            "metadata": user_data
        }
    )
    
    log_tool_call("add_user_to_memory", {"user_id": user_id, "name": user_profile.name}, None)

def add_course_to_memory(user_id: str, course: Course) -> None:
    """Add course information to memory service."""
    course_data = {
        "type": "course",
        "user_id": user_id,
        "course": asdict(course)
    }
    
    # Add to memory with searchable content
    memory_service.add_session_to_memory(
        session_data={
            "user_id": user_id,
            "content": f"Course: {course.title} - {course.description}. Level: {course.level}",
            "metadata": course_data
        }
    )
    
    log_tool_call("add_course_to_memory", {"user_id": user_id, "course_title": course.title}, None)

def get_user_courses_from_memory(user_id: str) -> List[Course]:
    """Retrieve user's courses from memory service."""
    search_results = memory_service.search_memory(
        query=f"user_id:{user_id} type:course",
        similarity_top_k=10
    )
    
    courses = []
    for result in search_results:
        if result.get("metadata", {}).get("type") == "course":
            course_data = result["metadata"]["course"]
            courses.append(Course(**course_data))
    
    return courses

# Legacy functions for backward compatibility
def initialize_session(user_id: str) -> str:
    """Legacy function - initialize session without user context."""
    return initialize_session_with_user_context(user_id)

def update_session_state(session_id: str, new_state: SessionState, data: Dict[str, Any] = None) -> None:
    """Legacy function - update session state."""
    updates = {"current_step": new_state.value}
    if data:
        updates.update(data)
    update_session_state_adk(session_id, updates)

def add_to_memory(session_id: str, key: str, data: Any) -> None:
    """Legacy function - add to memory."""
    try:
        context = get_user_context_from_session(session_id)
        user_id = context["user_id"]
        memory_key = f"{user_id}:{key}"
        memory_service.add_session_to_memory({
            "user_id": user_id,
            "content": f"{key}: {str(data)}",
            "metadata": {"key": key, "data": data}
        })
    except Exception as e:
        log_error("add_to_memory", e, session_id)

def retrieve_from_memory(user_id: str, query: str) -> List[Dict[str, Any]]:
    """Legacy function - retrieve from memory."""
    try:
        return memory_service.search_memory(f"user_id:{user_id} {query}")
    except Exception as e:
        log_error("retrieve_from_memory", e, None)
        return []

# ------------------------------------------------------------------------
# Chat Handling and Orchestration
# ------------------------------------------------------------------------

def handle_chat_message_enhanced(
    session_id: str, 
    message: str,
    user_profile: Optional[UserProfile] = None,
    current_course: Optional[Course] = None
) -> Dict[str, Any]:
    """
    Enhanced chat message handler that properly uses ADK session state and context.
    """
    log_agent_call("handle_chat_message_enhanced", {
        "session_id": session_id, 
        "message": message,
        "has_profile": user_profile is not None,
        "has_course": current_course is not None
    }, session_id)

    try:
        # Get current session and context
        user_context = get_user_context_from_session(session_id)
        current_step = SessionState(user_context["current_step"])
        
        print(f"Session {session_id} current state: {current_step.value}")
        print(f"Session {session_id} - User Profile: {user_context['user_profile']}")
        print(f"Session {session_id} - Current Course: {user_context['current_course']}")

        # If we have new user profile or course data, update session state
        if user_profile or current_course:
            state_updates = {}
            
            if user_profile:
                state_updates.update({
                    "user:profile_id": user_profile.userId,
                    "user:name": user_profile.name,
                    "user:email": user_profile.email,
                    "user:preferences": json.dumps(user_profile.preferences) if user_profile.preferences else "{}"
                })
                # Add to memory for long-term storage
                add_user_to_memory(user_profile.userId, user_profile)
            
            if current_course:
                course_state_updates = {
                    "current_course_id": current_course.id,
                    "current_course_title": current_course.title,
                    "current_course_description": current_course.description,
                    "current_course_level": current_course.level
                }
                
                # Handle course_details_json serialization
                if current_course.course_details_json is not None:
                    if isinstance(current_course.course_details_json, dict):
                        course_state_updates["current_course_details_json"] = json.dumps(current_course.course_details_json)
                    else:
                        course_state_updates["current_course_details_json"] = current_course.course_details_json
                
                state_updates.update(course_state_updates)
                # Add to memory for long-term storage
                add_course_to_memory(user_context["user_id"], current_course)
            
            if state_updates:
                update_session_state_adk(session_id, state_updates, "system")
                # Refresh context after update
                user_context = get_user_context_from_session(session_id)

        # Prepare enhanced context for agents
        agent_context = {
            "session_id": session_id,
            "user_context": user_context,
            "message": message,
            "current_step": current_step.value
        }

        # Prepare agent input with consolidated context
        consolidated_context = user_context.get("consolidated_context", "")
        
        # Create enhanced message that includes consolidated context
        enhanced_message = f"{consolidated_context}\n\nUser Message: {message}" if consolidated_context else message
        
        # Use root agent to orchestrate the response
        # Create a new instance of the root agent with the consolidated context in its instruction
        contextual_root_agent = create_root_agent_with_context(consolidated_context)
        
        log_agent_call(contextual_root_agent.name, agent_context, session_id)
        
        # Pass the user message to the contextual root agent
        agent_result = contextual_root_agent.run(
            inputs={"message": message}, # Pass only the user message as context is in instruction
            state=user_context  # Pass full context as state (optional, but good practice)
        )
        
        log_agent_response(contextual_root_agent.name, agent_result, session_id)

        # Process agent result and update session state
        if agent_result:
            agent_response_text = agent_result.get("response", "I'm processing your request...")
            
            # Update chat context in session state
            chat_context_updates = user_context.get("chat_context", {})
            chat_context_updates["last_message"] = message
            chat_context_updates["last_response"] = agent_response_text
            
            state_updates = {
                "chat_context": chat_context_updates,
                "temp:last_interaction": f"User: {message} | Agent: {agent_response_text[:100]}..."
            }
            
            # Apply any workflow-specific state changes based on agent result
            if agent_result.get("next_step"):
                state_updates["current_step"] = agent_result["next_step"]
            
            update_session_state_adk(session_id, state_updates, "agent")
            
            # Prepare UI updates
            ui_updates = agent_result.get("ui_updates", {})
            
            return {
                "response": agent_response_text,
                "ui_updates": ui_updates,
                "session_id": session_id,
                "user_context": user_context
            }
        else:
            return {
                "response": "I encountered an issue processing your request. Please try again.",
                "ui_updates": {},
                "session_id": session_id,
                "user_context": user_context
            }

    except Exception as e:
        log_error("handle_chat_message_enhanced", e, session_id)
        import traceback
        traceback.print_exc()
        
        # Update session to error state using ADK pattern
        error_state_updates = {
            "current_step": SessionState.ERROR.value,
            "temp:last_error": str(e)
        }
        try:
            update_session_state_adk(session_id, error_state_updates, "system")
        except:
            pass  # Don't fail on error state update failure
            
        return {
            "response": "An internal error occurred while processing your message.",
            "ui_updates": {"current_agent_id": "principal"},
            "session_id": session_id,
            "user_context": {}
        }

# ------------------------------------------------------------------------
# Session Initialization API for External Integration
# ------------------------------------------------------------------------

def initialize_session_for_api(user_id: str, course_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Initializes a new session for API interaction, fetching user and course data from the database.
    """
    log_agent_call("initialize_session_for_api", {"user_id": user_id, "course_id": course_id}, None)
    try:
        # Placeholder for fetching user profile and course from database
        # In a real system, this would involve database queries
        user_profile = UserProfile(userId=user_id, name="Test User", email="test@example.com", preferences={"theme": "dark"})
        current_course = None
        if course_id:
            current_course = Course(
                id=course_id,
                title="Test Course",
                description="A course for testing.",
                level="Beginner"
            )
        
        session_id = initialize_session_with_user_context(user_id, user_profile, current_course)
        
        log_agent_response("initialize_session_for_api", {"session_id": session_id}, session_id)
        return {"session_id": session_id}
    except Exception as e:
        log_error("initialize_session_for_api", e, None)
        return {"error": str(e)}
        

def update_session_context(
    session_id: str, 
    user_profile_data: Optional[Dict[str, Any]] = None,
    current_course_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Update session context with new user profile or course data.
    
    Args:
        session_id: The session to update
        user_profile_data: Updated user profile information
        current_course_data: Updated course information
    Returns:
        Dict with update status
    """
    log_agent_call("update_session_context", {"session_id": session_id, "has_profile_data": user_profile_data is not None, "has_course_data": current_course_data is not None}, session_id)
    try:
        session = session_service.get_session(
            app_name=APP_NAME,
            user_id=None,
            session_id=session_id
        )
        if not session:
            raise ValueError(f"Session {session_id} not found")

        state_updates = {}
        if user_profile_data:
            state_updates.update({
                "user:profile_id": user_profile_data.get("userId"),
                "user:name": user_profile_data.get("name"),
                "user:email": user_profile_data.get("email"),
                "user:preferences": json.dumps(user_profile_data.get("preferences", {}))
            })
            # Update user in memory as well
            user_profile = UserProfile(
                userId=user_profile_data.get("userId"),
                name=user_profile_data.get("name"),
                email=user_profile_data.get("email"),
                courses=[Course(**c) for c in user_profile_data.get("courses", [])],
                preferences=user_profile_data.get("preferences", {})
            )
            add_user_to_memory(user_profile.userId, user_profile)

        if current_course_data:
            state_updates.update({
                "current_course_id": current_course_data.get("id"),
                "current_course_title": current_course_data.get("title"),
                "current_course_description": current_course_data.get("description"),
                "current_course_level": current_course_data.get("level")
            })
            # Update course in memory as well
            current_course = Course(
                id=current_course_data.get("id"),
                title=current_course_data.get("title"),
                description=current_course_data.get("description"),
                level=current_course_data.get("level")
            )
            add_course_to_memory(session.user_id, current_course) # Assuming user_id is available in session

        if state_updates:
            update_session_state_adk(session_id, state_updates, event_author="api")
        
        log_agent_response("update_session_context", {"status": "success"}, session_id)
        return {"status": "success"}
    except Exception as e:
        log_error("update_session_context", e, session_id)
        return {"error": str(e)}

def get_session_info(session_id: str) -> Dict[str, Any]:
    """
    Get comprehensive session information for API consumers.
    
    Args:
        session_id: The session to retrieve
        
    Returns:
        Dict with session information and context
    """
    try:
        user_context = get_user_context_from_session(session_id)
        
        return {
            "status": "success",
            "session_id": session_id,
            "user_context": user_context,
            "message": "Session information retrieved successfully"
        }
        
    except Exception as e:
        log_error("get_session_info", e, session_id)
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to retrieve session information"
        }

# Legacy function for backward compatibility
def handle_chat_message(session_id: str, message: str) -> Dict[str, Any]:
    """Legacy chat message handler - uses enhanced version internally."""
    return handle_chat_message_enhanced(session_id, message)