import datetime
from zoneinfo import ZoneInfo
from typing import List, Dict, Any, Optional
import uuid
import json

from google.adk.agents import Agent, LlmAgent
from google.adk.tools import google_search, FunctionTool

# -------------------------------------------------------------------------
# Helper functions and sample data
# -------------------------------------------------------------------------

# Sample course data for testing
SAMPLE_COURSES = [
    {
        "course_id": "course-001",
        "name": "Introduction to Educational Psychology",
        "summary": "An introductory course on educational psychology and learning theories.",
        "objectives": [
            "Understand key concepts of educational psychology",
            "Apply learning theories to classroom practice",
            "Analyze student learning needs",
            "Design effective assessments",
            "Evaluate teaching effectiveness"
        ],
        "blooms_levels": ["Understanding", "Application", "Analysis", "Creation", "Evaluation"]
    },
    {
        "course_id": "course-002",
        "name": "Advanced Instructional Design",
        "summary": "Advanced techniques for effective course design and delivery.",
        "objectives": [
            "Analyze learning context and student needs",
            "Design comprehensive instructional materials",
            "Develop technology-enhanced learning activities",
            "Evaluate instructional effectiveness",
            "Create innovative assessment strategies"
        ],
        "blooms_levels": ["Analysis", "Creation", "Evaluation"]
    }
]

# -------------------------------------------------------------------------
# Tools implementation
# -------------------------------------------------------------------------

def get_course_list() -> Dict[str, Any]:
    """Returns a list of available courses."""
    courses = []
    
    for course in SAMPLE_COURSES:
        courses.append({
            "id": course["course_id"],
            "name": course["name"],
            "objectives_count": len(course["objectives"])
        })
    
    return {
        "status": "success",
        "courses": courses
    }

def get_course_details(course_id: str) -> Dict[str, Any]:
    """Get detailed information about a specific course."""
    # Find the course in our sample data
    for course in SAMPLE_COURSES:
        if course["course_id"] == course_id:
            return {
                "status": "success",
                "course": course
            }
    
    return {
        "status": "error",
        "error_message": f"Course with ID {course_id} not found"
    }

def generate_learning_objectives(topic: str, count: int = 5) -> Dict[str, Any]:
    """Generate learning objectives for a given topic."""
    blooms_verbs = {
        "Remembering": ["recall", "define", "list", "identify", "name"],
        "Understanding": ["explain", "describe", "discuss", "interpret", "summarize"],
        "Application": ["apply", "implement", "use", "demonstrate", "illustrate"],
        "Analysis": ["analyze", "examine", "differentiate", "categorize", "compare"],
        "Evaluation": ["evaluate", "assess", "critique", "judge", "justify"],
        "Creation": ["create", "design", "develop", "formulate", "propose"]
    }
    
    # Ensure we use a variety of Bloom's levels
    selected_levels = list(blooms_verbs.keys())
    if count < len(selected_levels):
        selected_levels = selected_levels[:count]
    
    objectives = []
    for i in range(min(count, len(selected_levels))):
        level = selected_levels[i]
        verb = blooms_verbs[level][i % len(blooms_verbs[level])]
        objectives.append({
            "text": f"{verb.capitalize()} the key concepts and principles of {topic}",
            "bloom_level": level
        })
    
    return {
        "status": "success",
        "objectives": objectives
    }

def generate_course_structure(objectives: List[Dict[str, Any]], weeks: int = 12) -> Dict[str, Any]:
    """Generate a course structure based on learning objectives."""
    if not objectives:
        return {
            "status": "error",
            "error_message": "No objectives provided"
        }
    
    # Create a course structure
    structure = {
        "title": "Course Structure",
        "duration_weeks": weeks,
        "modules": []
    }
    
    # Calculate modules (group objectives together)
    module_count = min(len(objectives), 5)  # Max 5 modules
    objectives_per_module = len(objectives) // module_count
    
    for i in range(module_count):
        module = {
            "id": i + 1,
            "title": f"Module {i + 1}",
            "weeks": weeks // module_count,
            "objectives": [],
            "topics": [],
            "activities": []
        }
        
        # Assign objectives to this module
        start_idx = i * objectives_per_module
        end_idx = start_idx + objectives_per_module if i < module_count - 1 else len(objectives)
        
        for obj in objectives[start_idx:end_idx]:
            module["objectives"].append(obj["text"])
            
            # Generate a topic based on the objective
            topic = "Topic: " + obj["text"].split(" ", 1)[1] if " " in obj["text"] else obj["text"]
            module["topics"].append(topic)
            
            # Add activities based on Bloom's level
            if obj["bloom_level"] in ["Remembering", "Understanding"]:
                module["activities"].append("Lecture and discussion")
            elif obj["bloom_level"] in ["Application", "Analysis"]:
                module["activities"].append("Case study and group work")
            else:  # Evaluation, Creation
                module["activities"].append("Project work and presentations")
        
        structure["modules"].append(module)
    
    return {
        "status": "success",
        "structure": structure
    }

def generate_assessment(course_id: str, assessment_type: str = "quiz") -> Dict[str, Any]:
    """Generate an assessment for a specific course."""
    # Get course details
    course_result = get_course_details(course_id)
    if course_result["status"] != "success":
        return course_result
    
    course = course_result["course"]
    
    # Convert objectives to the format needed for assessment generation
    objectives = []
    bloom_keywords = {
        "understand": "Understanding",
        "apply": "Application",
        "analyze": "Analysis",
        "design": "Creation",
        "create": "Creation",
        "evaluate": "Evaluation",
    }
    
    for obj in course["objectives"]:
        obj_lower = obj.lower()
        level = next((bloom_keywords[kw] for kw in bloom_keywords if kw in obj_lower), "Understanding")
        objectives.append({
            "text": obj,
            "bloom_level": level
        })
    
    # Configure assessment based on type
    if assessment_type == "quiz":
        title = f"Quiz for {course['name']}"
        question_types = ["mcq", "true_false"]
        questions_per_type = 3
    elif assessment_type == "exam":
        title = f"Exam for {course['name']}"
        question_types = ["mcq", "true_false", "short_answer", "essay"]
        questions_per_type = 2
    else:  # Default to assignment
        title = f"Assignment for {course['name']}"
        question_types = ["essay", "project"]
        questions_per_type = 1
    
    # Generate questions
    questions = []
    for q_type in question_types:
        for i in range(questions_per_type):
            # Select an objective (rotating through them)
            obj_idx = (len(questions)) % len(objectives)
            obj = objectives[obj_idx]
            
            question = {
                "id": f"Q{len(questions) + 1}",
                "type": q_type,
                "text": f"Question about {obj['text']} ({q_type})",
                "bloom_level": obj["bloom_level"],
            }
            
            # Add type-specific details
            if q_type == "mcq":
                question["options"] = [
                    {"id": "A", "text": "First option"},
                    {"id": "B", "text": "Second option"},
                    {"id": "C", "text": "Third option"},
                    {"id": "D", "text": "Fourth option"}
                ]
                question["correct_answer"] = "A"
            elif q_type == "true_false":
                question["options"] = [{"id": "T", "text": "True"}, {"id": "F", "text": "False"}]
                question["correct_answer"] = "T"
            
            questions.append(question)
    
    return {
        "status": "success",
        "assessment": {
            "title": title,
            "course_id": course_id,
            "type": assessment_type,
            "questions": questions,
            "total_questions": len(questions),
            "question_types": question_types
        }
    }

def recommend_resources(topic: str, resource_types: List[str] = ["article", "video", "book"]) -> Dict[str, Any]:
    """Recommend learning resources for a topic."""
    if not topic:
        return {
            "status": "error",
            "error_message": "No topic provided"
        }
    
    resources = []
    for res_type in resource_types:
        resource = {
            "type": res_type,
            "title": f"{res_type.capitalize()} about {topic}",
            "url": f"https://example.edu/resources/{res_type}/{topic.replace(' ', '-').lower()}",
            "description": f"A {res_type} explaining {topic} concepts and applications."
        }
        resources.append(resource)
    
    return {
        "status": "success",
        "resources": resources,
        "count": len(resources)
    }

def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city for which to retrieve the weather report.

    Returns:
        dict: status and result or error msg.
    """
    if city.lower() == "new york":
        return {
            "status": "success",
            "report": (
                "The weather in New York is sunny with a temperature of 25 degrees"
                " Celsius (77 degrees Fahrenheit)."
            ),
        }
    else:
        return {
            "status": "error",
            "error_message": f"Weather information for '{city}' is not available.",
        }


def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city.

    Args:
        city (str): The name of the city for which to retrieve the current time.

    Returns:
        dict: status and result or error msg.
    """

    if city.lower() == "new york":
        tz_identifier = "America/New_York"
    else:
        return {
            "status": "error",
            "error_message": (
                f"Sorry, I don't have timezone information for {city}."
            ),
        }

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    report = (
        f'The current time in {city} is {now.strftime("%Y-%m-%d %H:%M:%S %Z%z")}'
    )
    return {"status": "success", "report": report}


def hello_world():
    return {"status": "success", "message": "Hello, ADK!"}

# -------------------------------------------------------------------------
# Agent definitions
# -------------------------------------------------------------------------

# Learning Objective Agent
learning_objective_agent = LlmAgent(
    name="learning_objective_agent",
    model="gemini-2.0-flash-exp",
    description="Creates Bloom's-aligned learning objectives based on course topics and goals.",
    instruction="""
    You are a learning objectives specialist. Your task is to:
    1. Analyze course topics and goals to create appropriate learning objectives
    2. Ensure objectives align with Bloom's taxonomy levels
    3. Write clear, measurable objectives that guide assessment design
    4. Balance different cognitive levels across the curriculum
    """,
    tools=[generate_learning_objectives]
)

# Course Planning Agent
course_planning_agent = Agent(
    name="course_planning_agent",
    model="gemini-2.0-flash-exp",
    description="Designs course structures with modules, topics, and activities based on learning objectives.",
    instruction="""
    You are a course planning specialist. Your task is to:
    1. Organize learning objectives into logical modules and topics
    2. Create a coherent sequence that builds knowledge progressively
    3. Recommend appropriate teaching activities for each module
    4. Ensure the course structure aligns with pedagogical best practices
    """,
    tools=[generate_course_structure, recommend_resources]
)

# Assessment Agent
assessment_agent = Agent(
    name="assessment_agent",
    model="gemini-2.0-flash-exp",
    description="Creates various assessment types (quizzes, exams, assignments) aligned with learning objectives.",
    instruction="""
    You are an assessment design specialist. Your task is to:
    1. Design assessments that align with specified learning objectives
    2. Create questions targeting appropriate Bloom's taxonomy levels
    3. Balance different question types for comprehensive evaluation
    4. Ensure assessments measure authentic learning outcomes
    """,
    tools=[generate_assessment]
)

# Course Management Agent
course_management_agent = Agent(
    name="course_management_agent",
    model="gemini-2.0-flash-exp",
    description="Helps users view, select, and manage courses.",
    instruction="""
    You are a course management assistant. Your task is to:
    1. Help users view and select from available courses
    2. Provide details about specific courses when requested
    3. Guide users in finding the right courses for their needs
    4. Connect users with appropriate specialized agents for course planning and assessment
    """,
    tools=[get_course_list, get_course_details]
)

# Create a dedicated search agent that only uses google_search
search_agent = Agent(
    name="search_agent",
    model="gemini-2.0-flash-exp",
    description="Performs web searches to find information about educational topics.",
    instruction="""
    You are a research assistant. Your task is to:
    1. Search the web for information about educational topics
    2. Find current best practices in teaching and learning
    3. Locate relevant resources for curriculum development
    4. Discover the latest research in educational psychology and pedagogy
    """,
    tools=[google_search]  # This agent ONLY uses the built-in google_search tool
)

# Educational Tools Agent
educational_tools_agent = Agent(
    name="educational_tools_agent",
    model="gemini-2.0-flash-exp",
    description="Provides tools for course planning, objectives, and assessment.",
    instruction="""
    You are an educational tools specialist. Your task is to:
    1. Help users with course planning and structure
    2. Generate learning objectives for specific topics
    3. Create assessments aligned with learning objectives
    4. Recommend learning resources for course topics
    
    Use the available tools to provide these services, and explain the pedagogical principles behind your recommendations.
    """,
    tools=[
        get_course_list,
        get_course_details,
        generate_learning_objectives,
        generate_course_structure,
        generate_assessment,
        recommend_resources
    ]
)

# Root agent that orchestrates the specialized agents
root_agent = Agent(
    name="educational_design_assistant",
    model="gemini-2.0-flash-exp",
    description="Educational design assistant that helps with course planning, objectives, and assessment creation.",
    instruction="""
    You are an educational design assistant. Welcome users and explain that you can help with:
    
    1. Course planning and structure
    2. Creating learning objectives aligned with Bloom's taxonomy
    3. Designing assessments (quizzes, exams, assignments)
    4. Recommending learning resources
    5. Researching educational topics
    
    For general questions requiring web searches, defer to the search_agent.
    For course planning, objectives, assessments and resources, use the educational_tools_agent.
    
    Always show users their options and guide them through the educational design process.
    Explain the pedagogical principles behind your recommendations.
    """,
    sub_agents=[
        search_agent,
        educational_tools_agent
    ]
)