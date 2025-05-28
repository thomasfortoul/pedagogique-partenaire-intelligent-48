import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Add the workspace root to the Python path to be able to import agents
# Get the directory of the current file (backend)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory (workspace root)
workspace_root = os.path.dirname(current_dir)
# Insert the workspace root at the beginning of sys.path
sys.path.insert(0, workspace_root)

# Attempt to import agent components
try:
    from agents.parent_folder.multi_tool_agent import tools
    from agents.parent_folder.multi_tool_agent import agentic_workflow_system as aws
    from agents.parent_folder.multi_tool_agent.agentic_workflow_system import SessionState
except ImportError as e:
    # This might happen if the agents directory structure is unexpected
    print(f"Error importing agent components: {e}")
    print("Ensure the agents directory structure is correct and the workspace root is in Python path.")
    tools = None # Or implement a mock for development if needed
    aws = None
    SessionState = None
except ImportError as e:
    # This might happen if the agents directory structure is unexpected
    print(f"Error importing agent tools: {e}")
    print("Ensure the agents directory structure is correct and the workspace root is in Python path.")
    tools = None # Or implement a mock for development if needed

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for now, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Objective(BaseModel):
    text: str
    bloom_level: str

class GenerateQuizRequest(BaseModel):
    objectives: List[Objective]
    question_counts: Dict[str, int]
    difficulty: str = "medium"

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    ui_updates: Optional[Dict[str, Any]] = None # Structured data for UI updates

@app.post("/generate-quiz")
async def generate_quiz_endpoint(request: GenerateQuizRequest):
    """
    Endpoint to trigger the quiz generation agent workflow.
    """
    if tools is None:
        raise HTTPException(status_code=500, detail="Agent tools not available. Backend not configured correctly.")

    try:
        # Convert Pydantic models to dictionaries for the agent tool
        objectives_data = [obj.model_dump() for obj in request.objectives]
        
        result = tools.generate_quiz(
            objectives=objectives_data,
            question_counts=request.question_counts,
            difficulty=request.difficulty
        )
        
        if result.get("status") == "success":
            return result.get("quiz")
        else:
            # Handle potential errors from the agent tool
            raise HTTPException(status_code=500, detail=result.get("error_message", "Error generating quiz"))
            
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint to handle chat interactions with the agent workflow.
    Manages session and routes messages to the agent orchestrator.
    """
    if aws is None:
        raise HTTPException(status_code=500, detail="Agent workflow system not available.")

    session_id = request.session_id

    # If no session ID is provided, initialize a new session
    if not session_id:
        # In a real application, user_id would come from authentication
        user_id = "anonymous_user" # Placeholder user ID
        session_id = aws.initialize_session(user_id)
        print(f"Initialized new session: {session_id}")
    else:
        # TODO: Validate if the session_id is valid and belongs to the current user
        print(f"Using existing session: {session_id}")

    try:
        # Pass the message and session ID to the agent orchestration system
        # TODO: Implement a chat handling function in agentic_workflow_system.py
        # This function should process the message, interact with agents,
        # update session state, and return the agent's response and UI updates.
        agent_output = aws.handle_chat_message(session_id, request.message)

        return ChatResponse(
            session_id=session_id,
            response=agent_output.get("response", "No response from agent."),
            ui_updates=agent_output.get("ui_updates")
        )

    except Exception as e:
        # Log the error and return a generic error message to the user
        print(f"Error processing chat message for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your message.")


@app.get("/")
async def read_root():
    return {"message": "Agentic Workflow System Backend is running"}

# To run this application, you would typically use:
# uvicorn main:app --reload --port 8000
# from the 'backend' directory.

# Initialize a default session for now (will be managed per user/frontend later)
# In a real application, session management would be more robust
# For this MDP, we'll use a simple approach
if aws:
    # Check if a default session already exists (e.g., from a previous run)
    # This is a very basic check and might need refinement
    try:
        # Attempt to get a known session ID, or list sessions
        # For simplicity, let's assume we'll always create a new session for now
        # In a real app, you'd check for an existing session_id from the frontend
        pass # No action needed here, session is created on first chat request if none provided
    except Exception as e:
        print(f"Error initializing session service: {e}")
        # Handle error, maybe disable chat functionality
        aws = None # Disable chat if session service fails