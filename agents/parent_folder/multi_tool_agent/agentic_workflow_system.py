"""
Agentic Workflow System for Course Preparation, Planning, and Assessment Generation
Implements the agent types and orchestration patterns defined in agents.txt
"""

import json
from typing import List, Dict, Any, Optional, Tuple, Union
from enum import Enum
from dataclasses import dataclass, field

from google.adk.agents import Agent, LlmAgent, SequentialAgent, LoopAgent
from google.adk.sessions import InMemorySessionService, BaseSessionService
from google.adk.memory import InMemoryMemoryService, BaseMemoryService
from google.adk.sessions import BaseSessionService as SessionService
from google.adk.memory import BaseMemoryService as MemoryService
from models import Course, TaskDocument, UserInteractionState

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

# Sequential Agent - Course Prep Workflow Agent
course_prep_workflow_agent = SequentialAgent(
    name="course_prep_workflow_agent",
    description="Orchestrates Phase 1 tasks in order: NeedsAnalysis → ObjectiveDraft → StructureProposal",
    agents=[
        Agent(
            name="needs_analysis_agent", 
            model="gemini-2.0-flash-exp",
            description="Analyzes course requirements and learner needs",
            instruction="Analyze course requirements and learner profiles to identify key needs."
        ),
        learning_objective_agent,
        syllabus_planner_agent
    ]
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