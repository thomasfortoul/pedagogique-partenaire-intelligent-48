"""
Agentic Workflow System for Course Preparation, Planning, and Assessment Generation
Implements the agent types and orchestration patterns defined in agents.txt
"""

import json
from typing import List, Dict, Any, Optional, Tuple, Union
from enum import Enum
from dataclasses import dataclass, field
from .logger import log_agent_call, log_agent_response, log_error, log_tool_call, log_tool_response

from google.adk.agents import Agent, LlmAgent, SequentialAgent, LoopAgent
from google.adk.sessions import InMemorySessionService, BaseSessionService
from google.adk.memory import InMemoryMemoryService, BaseMemoryService
from google.adk.sessions import BaseSessionService as SessionService
from google.adk.memory import BaseMemoryService as MemoryService
from .models import Course, TaskDocument, UserInteractionState

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

def extract_learning_objectives(document: str, course_context: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts learning objectives from course materials or program descriptions."""
    # This would use an LLM to analyze the document for learning objectives
    # For now, we return a simple placeholder
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
    You are a learning objectives specialist. Your task is to:
    1. Analyze program descriptions and learner profiles
    2. Draft clear, measurable learning objectives aligned with Bloom's taxonomy
    3. Ensure objectives cover various cognitive levels from understanding to creation
    4. Structure objectives to support constructive alignment between content and assessment
    """,
    tools=[extract_learning_objectives, check_bloom_alignment]
)

# LLM Agent - Syllabus Planner Agent
syllabus_planner_agent = LlmAgent(
    name="syllabus_planner_agent",
    model="gemini-2.0-flash-exp",
    description="Structures modules and sessions into a coherent syllabus outline.",
    instruction="""
    You are a curriculum design specialist. Your task is to:
    1. Take verified learning objectives as input
    2. Create a logical sequence of modules and sessions
    3. Allocate appropriate time for each topic
    4. Ensure progression from foundational to advanced concepts
    5. Balance theory, practice, and assessment activities
    """,
    tools=[plan_course_structure]
)

# LLM Agent - Assessment Generator Agent
assessment_generator_agent = LlmAgent(
    name="assessment_generator_agent",
    model="gemini-2.0-flash-exp",
    description="Creates assessment items (MCQs, open-ended questions, case studies) matched to objectives.",
    instruction="""
    You are an assessment design specialist. Your task is to:
    1. Take learning objectives and their Bloom's level as input
    2. Generate questions that truly measure the intended objective
    3. Create a variety of question types (MCQ, open-ended, case studies)
    4. Ensure questions target the appropriate cognitive level
    5. Provide answer keys, rubrics, or scoring guides as appropriate
    """,
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
    You are a request analyzer. Your job is to:
    1. Analyze the user's request to determine its primary purpose
    2. Route syllabus or course structure requests to the syllabus_planner_agent
    3. Route assessment or question generation requests to the assessment_generator_agent
    4. For ambiguous requests, ask clarifying questions before routing
    """,
    tools=[]  # Routing logic would be implemented in this agent's code
)

# Resource Recommendation Agent
resource_recommendation_agent = Agent(
    name="resource_recommendation_agent",
    model="gemini-2.0-flash-exp",
    description="Recommends learning resources for course topics.",
    instruction="""
    You are a learning resources specialist. Your task is to:
    1. Analyze course topics and objectives
    2. Recommend high-quality, relevant learning resources
    3. Include a mix of media types (readings, videos, interactive tools)
    4. Consider accessibility and diversity in your recommendations
    """,
    tools=[recommend_resources]
)

# ------------------------------------------------------------------------
# Root Orchestrator Agent
# ------------------------------------------------------------------------

root_agent = Agent(
    name="pedagogical_orchestrator",
    model="gemini-2.0-flash-exp",
    description="Orchestrates the entire course planning and assessment generation process.",
    instruction="""
    You are the main orchestrator for course planning and assessment development.
    Analyze the user's request and:
    1. For course planning, invoke the course preparation workflow
    2. For objectives refinement, use the iterative refinement loop
    3. For content generation, route to the appropriate specialist agent
    4. For assessment creation, engage the assessment generator
    5. For resource recommendations, use the resource recommendation agent
    
    Always maintain pedagogical alignment between objectives, content, and assessment.
    """,
    tools=[]  # The orchestrator uses other agents rather than direct tools
)

# ------------------------------------------------------------------------
# Session and Memory Services
# ------------------------------------------------------------------------

# Initialize services for development
session_service = InMemorySessionService()
memory_service = InMemoryMemoryService()

# Function to initialize a session
def initialize_session(user_id: str) -> str:
    """Initialize a new session for a user."""
    session_id = session_service.create_session()
    initial_state = {
        "user_id": user_id,
        "current_state": SessionState.OBJECTIVES_CAPTURED.value,
        "course": None,
        "objectives": [],
        "structure": [],
        "assessments": []
    }
    session_service.update_session_state(session_id, initial_state)
    return session_id

# Function to update session state
def update_session_state(session_id: str, new_state: SessionState, data: Dict[str, Any] = None) -> None:
    """Update the state of a session."""
    current_state = session_service.get_session_state(session_id)
    current_state["current_state"] = new_state.value
    
    if data:
        current_state.update(data)
    
    session_service.update_session_state(session_id, current_state)

# Function to add to memory
def add_to_memory(session_id: str, key: str, data: Any) -> None:
    """Add data to the memory service."""
    session_state = session_service.get_session_state(session_id)
    memory_key = f"{session_state.get('user_id', 'anonymous')}:{key}"
    memory_service.add(memory_key, data)

# Function to retrieve from memory
def retrieve_from_memory(user_id: str, query: str) -> List[Dict[str, Any]]:
    """Retrieve data from memory based on a query."""
    return memory_service.search(query, filter_={"user_id": user_id})

# ------------------------------------------------------------------------
# Chat Handling and Orchestration
# ------------------------------------------------------------------------

def handle_chat_message(session_id: str, message: str) -> Dict[str, Any]:
    """
    Handles an incoming chat message, orchestrates agents based on session state,
    and updates session state and returns agent response with UI updates.
    """
    log_agent_call("handle_chat_message", {"session_id": session_id, "message": message}, session_id)

    session_state = session_service.get_session_state(session_id)
    current_state_value = session_state.get("current_state", SessionState.OBJECTIVES_CAPTURED.value)
    current_state = SessionState(current_state_value)
    user_id = session_state.get("user_id", "anonymous_user")

    print(f"Session {session_id} current state: {current_state.value}")

    agent_response_text = "I'm not sure how to respond to that."
    ui_updates_data: Dict[str, Any] = {}
    next_state = current_state

    try:
        if current_state == SessionState.OBJECTIVES_CAPTURED:
            print(f"State: OBJECTIVES_CAPTURED. Processing message for objectives using learning_objective_agent.")
            # Use learning_objective_agent to process the message and extract objectives
            if learning_objective_agent:
                # In a real scenario, the agent would take the raw message and context
                # For simplification, we'll pass the message as a "document"
                agent_input = {"document": message, "course_context": {}}
                log_agent_call(learning_objective_agent.name, agent_input, session_id)
                agent_result = learning_objective_agent.run(agent_input) # Assuming .run() method exists and returns dict
                log_agent_response(learning_objective_agent.name, agent_result, session_id)

                if agent_result and agent_result.get("status") == "success" and agent_result.get("objectives"):
                    objectives = agent_result["objectives"]
                    session_state["objectives"] = objectives
                    agent_response_text = "Okay, I have captured the following objectives:\n" + "\n".join(objectives) + "\n\nWhat type of document would you like to create (e.g., Exam, Quiz)?"
                    next_state = SessionState.STRUCTURE_PROPOSED
                    ui_updates_data["taskParameters"] = {"learningObjectives": ", ".join(objectives)}
                    ui_updates_data["current_agent_id"] = "pedagogie"
                    print(f"Objectives captured. Transitioning to state: {next_state.value}")
                else:
                    agent_response_text = "I couldn't extract clear objectives. Please try rephrasing or be more specific."
                    print("Learning objective agent failed or returned no objectives. Staying in current state.")
            else:
                agent_response_text = "Learning objective agent is not available."
                print("Learning objective agent is None. Staying in current state.")

        elif current_state == SessionState.STRUCTURE_PROPOSED:
            print(f"State: STRUCTURE_PROPOSED. Processing message for document type using syllabus_planner_agent (conceptually).")
            # In a real scenario, syllabus_planner_agent might refine the document type or ask for more details.
            # For simplification, we'll directly process the message as document type.
            document_type = message.strip()
            if document_type:
                session_state["outputType"] = document_type
                agent_response_text = f"Understood. You want to create a '{document_type}'. What Bloom's Taxonomy level(s) should the assessment target?"
                next_state = SessionState.DRAFT_READY
                ui_updates_data["taskParameters"] = {"outputType": document_type}
                ui_updates_data["current_agent_id"] = "bloom"
                print(f"Document type captured. Transitioning to state: {next_state.value}")
            else:
                 agent_response_text = "Please specify the type of document you want to create (e.g., Exam, Quiz)."
                 print("No document type found in message. Staying in current state.")

        elif current_state == SessionState.DRAFT_READY:
             print(f"State: DRAFT_READY. Processing message for Bloom's levels using assessment_generator_agent (conceptually).")
             # In a real scenario, assessment_generator_agent might validate or refine Bloom's levels.
             # For simplification, we'll directly process the message as Bloom's level.
             blooms_level = message.strip()
             if blooms_level:
                 session_state["bloomsLevel"] = blooms_level
                 agent_response_text = f"Targeting Bloom's level(s): {blooms_level}. I can now generate the assessment. Are you ready?"
                 next_state = SessionState.ASSESSMENT_CREATED
                 ui_updates_data["taskParameters"] = {"bloomsLevel": blooms_level}
                 ui_updates_data["current_agent_id"] = "questions"
                 print(f"Bloom's levels captured. Transitioning to state: {next_state.value}")
             else:
                 agent_response_text = "Please specify the Bloom's Taxonomy level(s)."
                 print("No Bloom's levels found in message. Staying in current state.")

        elif current_state == SessionState.ASSESSMENT_CREATED:
            print(f"State: ASSESSMENT_CREATED. Processing message for generation trigger.")
            # Assume user confirms readiness to generate
            if message.lower().strip() in ["yes", "ready", "oui", "prêt"]:
                agent_response_text = "Generating the assessment now..."
                ui_updates_data["current_agent_id"] = "createur" # Example: Move to Createur agent visually
                print("User confirmed readiness. Triggering assessment generation.")

                # Trigger the assessment generation workflow
                # This is a simplified call; real workflow would use session state data
                objectives_for_agent = [{"text": obj, "bloom_level": "Understanding"} for obj in session_state.get("objectives", [])] # Basic mapping
                question_counts_for_agent = {"mcq": 3, "short_answer": 1} # Example counts
                difficulty_for_agent = "medium" # Example difficulty

                log_tool_call("generate_quiz", {
                    "objectives": objectives_for_agent,
                    "question_counts": question_counts_for_agent,
                    "difficulty": difficulty_for_agent
                }, session_id)
                # Call the actual quiz generation tool
                if tools and hasattr(tools, 'generate_quiz'):
                    quiz_result = tools.generate_quiz(
                        objectives=objectives_for_agent,
                        question_counts=question_counts_for_agent,
                        difficulty=difficulty_for_agent
                    )
                    log_tool_response("generate_quiz", quiz_result, session_id)

                    if quiz_result.get("status") == "success":
                        generated_exam_data = quiz_result.get("quiz")
                        session_state["assessments"] = [generated_exam_data] # Store generated exam in session
                        agent_response_text = "The assessment has been generated."
                        ui_updates_data["generatedExam"] = generated_exam_data # Send generated exam to UI
                        next_state = SessionState.COMPLETED # Workflow completed (for this basic flow)
                        ui_updates_data["current_agent_id"] = "principal" # Example: Move back to Principal agent
                        print(f"Assessment generated successfully. Transitioning to state: {next_state.value}")
                    else:
                        agent_response_text = f"Error generating assessment: {quiz_result.get('error_message', 'Unknown error')}"
                        next_state = SessionState.ERROR
                        ui_updates_data["current_agent_id"] = "principal" # Example: Move back to Principal agent
                        print(f"Assessment generation failed. Transitioning to state: {next_state.value}")
                else:
                    agent_response_text = "Assessment generation tool not available."
                    next_state = SessionState.ERROR
                    ui_updates_data["current_agent_id"] = "principal" # Example: Move back to Principal agent
                    print("Assessment generation tool not available. Transitioning to state: ERROR")

            else:
                agent_response_text = "Please let me know when you are ready to generate the assessment by typing 'yes' or 'ready'."
                print("User did not confirm readiness. Staying in current state.")

        elif current_state == SessionState.COMPLETED:
            print(f"State: COMPLETED. Handling message in completed state.")
            agent_response_text = "The workflow is completed. You can download the generated assessment. What would you like to do next?"
            # Stay in completed state or transition based on new user input
            # For now, just acknowledge
            print("Acknowledging message in COMPLETED state.")


        elif current_state == SessionState.ERROR:
            print(f"State: ERROR. Handling message in error state.")
            agent_response_text = "An error occurred during the workflow. Please try again or start a new session."
            # Stay in error state or transition based on user input
            # For now, just acknowledge
            print("Acknowledging message in ERROR state.")

        else:
            print(f"Unknown state: {current_state.value}. Staying in current state.")


        # Always update the session state at the end
        session_state["current_state"] = next_state.value
        session_service.update_session_state(session_id, session_state)
        print(f"Session {session_id} state updated to: {session_state['current_state']}")


    except Exception as e:
        log_error("handle_chat_message", e, session_id)
        import traceback
        traceback.print_exc() # Print traceback for detailed error info
        agent_response_text = "An internal error occurred while processing your message."
        session_state["current_state"] = SessionState.ERROR.value
        session_service.update_session_state(session_id, session_state)
        ui_updates_data["current_agent_id"] = "principal" # Example: Move back to Principal agent
        print(f"Transitioning to state: ERROR due to exception.")


    print(f"Exiting handle_chat_message for session {session_id}. Returning response: '{agent_response_text[:50]}...', ui_updates: {ui_updates_data}")
    return {
        "response": agent_response_text,
        "ui_updates": ui_updates_data,
        "session_id": session_id # Return session_id in the response
    }