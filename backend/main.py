import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import openai
from dotenv import load_dotenv

# Add the workspace root to the Python path to be able to import agents
# Get the directory of the current file (backend)
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory (workspace root)
workspace_root = os.path.dirname(current_dir)
# Insert the workspace root at the beginning of sys.path
sys.path.insert(0, workspace_root)

# Simplified backend without google.adk.agents for direct OpenAI call
# We will directly import the simplified agentic_workflow_system
try:
    from agents.parent_folder.multi_tool_agent import agentic_workflow_system as aws
    print("Simplified agentic_workflow_system imported successfully.")
except ImportError as e:
    print(f"Error importing simplified agentic_workflow_system: {e}")
    aws = None
except Exception as e:
    print(f"Unexpected error during simplified agentic_workflow_system import: {e}")
    import traceback
    traceback.print_exc()
    aws = None

app = FastAPI()

# Load environment variables from .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for now, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    ui_updates: Optional[Dict[str, Any]] = None # Structured data for UI updates

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Endpoint to handle chat interactions with the simplified agent workflow.
    """
    print(f"Received chat request for session_id: {request.session_id}, message: {request.message}")

    if aws is None:
        print("Error: Simplified agent workflow system (aws) is not available.")
        raise HTTPException(status_code=500, detail="Simplified agent workflow system not available.")

    session_id = request.session_id

    try:
        # Pass the message and session ID to the simplified agent orchestration system
        print(f"Calling aws.handle_chat_message for session {session_id} with message: {request.message}")
        agent_output = aws.handle_chat_message(session_id, request.message)
        print(f"Received agent_output for session {session_id}: {agent_output}")

        # Ensure session_id is included in the response from handle_chat_message
        response_session_id = agent_output.get("session_id", session_id)

        return ChatResponse(
            session_id=response_session_id,
            response=agent_output.get("response", "No response from agent."),
            ui_updates=agent_output.get("ui_updates")
        )

    except Exception as e:
        print(f"Error processing chat message for session {session_id}: {e}")
        error_session_id = request.session_id if request.session_id else "unknown"
        raise HTTPException(status_code=500, detail=f"An error occurred while processing your message for session {error_session_id}.")
    
@app.post("/openai_test")
async def openai_test_endpoint(request: ChatRequest):
    """
    Endpoint to test OpenAI API with a simple text message.
    """
    if not openai.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not found.")

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": request.message}
            ]
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {e}")

@app.get("/")
async def read_root():
    return {"message": "Agentic Workflow System Backend is running"}

# To run this application, you would typically use:
# uvicorn main:app --reload --port 8000
# from the 'backend' directory.