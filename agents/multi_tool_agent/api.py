import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import uuid
from .logger import log_api_request, log_api_response, log_error

from google.adk.agents.llm_agent import LlmAgent
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, SseServerParams

import agentic_workflow_system as aws
import tools
from models import UserInteractionState, Course, TaskDocument, UserProfile # Import UserProfile

app = FastAPI()

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for session states (for demonstration purposes)
session_states: Dict[str, UserInteractionState] = {}

@app.post("/run") # Renamed from /agent_chat as per frontend's /run endpoint
async def run_agent_workflow(request: Request):
    data = await request.json()
    app_name = data.get("app_name") # Expecting app_name from frontend
    user_id = data.get("user_id")
    session_id = data.get("session_id")
    new_message_parts = data.get("new_message", {}).get("parts", [])
    user_message = ""
    for part in new_message_parts:
        if "text" in part:
            user_message += part["text"]

    course_data = data.get("course_data")
    user_profile_data = data.get("user_profile_data")

    log_api_request("/run", {
        "app_name": app_name,
        "user_id": user_id,
        "session_id": session_id,
        "new_message": user_message,
        "course_data": course_data,
        "user_profile_data": user_profile_data
    }, session_id)

    if not user_message:
        return JSONResponse(content={"detail": "Message cannot be empty"}, status_code=400)

    if not session_id or session_id not in session_states:
        # Initialize a new session
        session_id = str(uuid.uuid4())
        # Pass user_id and potentially other initial profile data to initialize_session
        initial_state = aws.initialize_session(user_id) # Pass user_id
        session_states[session_id] = initial_state
        print(f"Initialized new session: {session_id}")
    
    current_state = session_states[session_id]
    
    # Update current_state with course and user profile data
    if course_data:
        current_state.current_course = Course(**course_data)
    if user_profile_data:
        # Ensure courses within user_profile_data are also Course objects
        user_profile_data['courses'] = [Course(**c) for c in user_profile_data.get('courses', [])]
        current_state.user_profile = UserProfile(**user_profile_data)

    print(f"Session {session_id} - Current state: {current_state.current_step}")
    print(f"Session {session_id} - Current Course: {current_state.current_course.title if current_state.current_course else 'N/A'}")
    print(f"Session {session_id} - User Profile: {current_state.user_profile.userId if current_state.user_profile else 'N/A'}")

    try:
        # Simulate agent processing based on the current step
        # In a real scenario, you'd call the actual agentic workflow here
        # For now, we'll use a simplified flow based on the Generate.tsx logic
        
        # This is a simplified example. In a full ADK integration, you'd instantiate
        # your ADK agent and run its `run` method with the user message.
        # The agent would then use its tools and return a response.

        # Example of how you might integrate the ADK agent:
        # agent = LlmAgent(
        #     model="gemini-2.0-flash",
        #     name="multi_tool_agent",
        #     instruction="You are a helpful assistant for course planning and assessment.",
        #     tools=[
        #         tools.generate_syllabus,
        #         tools.generate_quiz,
        #         # Add other tools from your tools.py here
        #     ]
        # )
        # agent_response = await agent.run(user_message, state=current_state)
        # response_content = agent_response.output.text

        # For now, let's simulate a response and state update
        response_content = f"Received: '{user_message}'. Processing..."
        ui_updates = {}

        # Simulate progression through agents based on message content or step
        if "biologie introductive" in user_message.lower() and current_state.current_step == "initial":
            current_state.current_step = "objectives_definition"
            response_content = "Excellent! Pour commencer, quels sont les objectifs d'apprentissage spécifiques pour ce cours de biologie introductive?"
            ui_updates["taskParameters"] = {"course": "Biologie introductive"}
            ui_updates["current_agent_id"] = "objectifs"
        elif current_state.current_step == "objectives_definition":
            current_state.current_step = "pedagogical_approach"
            response_content = "Très bien. Maintenant, quelle approche pédagogique souhaitez-vous adopter pour atteindre ces objectifs? (ex: apprentissage par problèmes, cours magistral, etc.)"
            ui_updates["taskParameters"] = {"learningObjectives": user_message}
            ui_updates["current_agent_id"] = "pedagogie"
        elif current_state.current_step == "pedagogical_approach":
            current_state.current_step = "bloom_level_assessment"
            response_content = "Compris. À quel niveau de la taxonomie de Bloom souhaitez-vous que les questions soient principalement axées? (ex: Compréhension, Application, Analyse)"
            ui_updates["taskParameters"] = {"outputType": user_message} # Misusing outputType for now, should be a new field
            ui_updates["current_agent_id"] = "bloom"
        elif current_state.current_step == "bloom_level_assessment":
            current_state.current_step = "question_generation"
            response_content = "Parfait. Veuillez spécifier le nombre de questions par type (ex: QCM:5, Vrai/Faux:3, Réponse Courte:2) et la difficulté générale (facile, moyen, difficile)."
            ui_updates["taskParameters"] = {"bloomsLevel": user_message}
            ui_updates["current_agent_id"] = "questions"
        elif current_state.current_step == "question_generation":
            # This is where the actual quiz generation would happen
            # For now, simulate a generated exam
            generated_exam = {
                "title": "Examen de Biologie Introductive",
                "course": session_states[session_id].task_parameters.get("course", "Biologie Introductive"),
                "duration": "60 minutes",
                "instructions": "Répondez à toutes les questions. Bonne chance!",
                "questions": [
                    {"id": "q1", "type": "QCM", "points": 5, "text": "Quelle est la fonction principale des mitochondries?", "options": [{"id": "a", "text": "Production d'énergie"}, {"id": "b", "text": "Synthèse des protéines"}]},
                    {"id": "q2", "type": "Vrai/Faux", "points": 3, "text": "La photosynthèse se produit dans les racines des plantes."},
                    {"id": "q3", "type": "Réponse Courte", "points": 7, "text": "Décrivez brièvement le cycle de Krebs."}
                ]
            }
            response_content = "L'examen a été généré avec succès! Vous pouvez le consulter et le modifier."
            ui_updates["generatedExam"] = generated_exam
            ui_updates["current_agent_id"] = "createur"
            current_state.current_step = "finalized" # Mark as finalized
        else:
            response_content = "Je n'ai pas compris votre demande. Pouvez-vous reformuler?"
            ui_updates["current_agent_id"] = "principal" # Reset to principal if confused

        session_states[session_id] = current_state # Update the state

        return JSONResponse(content={
            "session_id": session_id,
            "response": response_content,
            "ui_updates": ui_updates
        })

    except Exception as e:
        log_error("run_agent_workflow", e, session_id)
        return JSONResponse(content={"detail": str(e)}, status_code=500)

    finally:
        # Log the response before sending it
        response_content = {
            "session_id": session_id,
            "response": response_content,
            "ui_updates": ui_updates
        }
        log_api_response("/run", response_content, session_id)

# The /generate-quiz endpoint remains as is, as it's a direct tool call.
# @app.post("/generate-quiz")
# async def generate_quiz_endpoint(request: Request):
#     """
#     Endpoint to generate a quiz using the multi_tool_agent's generate_quiz tool.
#     This is a direct call, not part of the chat workflow.
#     """
#     data = await request.json()
#     objectives = data.get("objectives")
#     question_counts = data.get("question_counts")
#     difficulty = data.get("difficulty", "medium")

#     if not objectives or not question_counts:
#         return JSONResponse(content={"detail": "Objectives and question_counts are required"}, status_code=400)

#     try:
#         log_api_request("/generate-quiz", {"objectives": objectives, "question_counts": question_counts, "difficulty": difficulty})
#         result = tools.generate_quiz(objectives, question_counts, difficulty)
#         if result["status"] == "success":
#             log_api_response("/generate-quiz", result["quiz"])
#             return JSONResponse(content=result["quiz"])
#         else:
#             log_api_response("/generate-quiz", {"detail": result.get("error_message", "Failed to generate quiz")}, status_code=500)
#             return JSONResponse(content={"detail": result.get("error_message", "Failed to generate quiz")}, status_code=500)
#     except Exception as e:
#         log_error("generate_quiz_endpoint", e)
#         return JSONResponse(content={"detail": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)