"""
Main application file for the Educational AI Assistant backend.
Integrates FastAPI with our simplified models and services.
"""

import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import openai

# Import our service components using absolute imports
from services import AIService, EducationalService

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize the application
app = FastAPI(
    title="Educational AI Assistant",
    description="A simplified backend for educational AI interactions",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
educational_service = EducationalService(ai_service)

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"status": "Educational AI Assistant API is running"}

@app.post("/openai_test")
async def openai_test_endpoint(request: Request):
    """
    Endpoint to test OpenAI API with a simple text message.
    This matches the endpoint expected by OpenAITest.tsx.
    """
    try:
        # Parse JSON from request body manually
        body = await request.json()
        message = body.get("message")
        
        # Basic validation
        if not message:
            return JSONResponse(
                status_code=400,
                content={"detail": "Message is required"}
            )
            
        # Check for OpenAI API key
        if not openai.api_key:
            return JSONResponse(
                status_code=500, 
                content={"detail": "OpenAI API key not found"}
            )
            
        # Simple OpenAI call
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": message}
                ]
            )
            return {"response": response.choices[0].message.content}
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"OpenAI API error: {str(e)}"}
            )
            
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=400, 
            content={"detail": "Invalid JSON"}
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Server error: {str(e)}"}
        )

@app.post("/chat")
async def chat(request: Request):
    """
    Process a chat message and return an educational response.
    
    This endpoint handles the main educational assistant functionality.
    """
    try:
        # Parse JSON from request body manually
        body = await request.json()
        
        # Extract data
        session_id = body.get("session_id")
        message = body.get("message")
        
        # Basic validation
        if not message:
            return JSONResponse(
                status_code=400,
                content={"error": "Message is required"}
            )
            
        # Process the message using our educational service
        result = await educational_service.process_message(session_id, message)
        
        # Return the response
        return result
        
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=400, 
            content={"error": "Invalid JSON"}
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Server error: {str(e)}"}
        )

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """
    Get details for a specific session.
    
    Returns session information including conversation history and learning objectives.
    """
    try:
        # Get the session
        session = educational_service.get_or_create_session(session_id)
        
        # Return session data
        return session.to_dict()
        
    except Exception as e:
        print(f"Error getting session: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Error retrieving session: {str(e)}"}
        )

# Placeholder for the MDP quiz generation endpoint - simple version for now
@app.post("/generate-quiz")
async def generate_quiz(request: Request):
    """
    Simple placeholder for the quiz generation endpoint.
    This matches what Generate.tsx is expecting.
    """
    try:
        # Parse the request
        body = await request.json()
        
        # Extract basic quiz parameters
        objectives = body.get("objectives", [])
        question_counts = body.get("question_counts", {})
        difficulty = body.get("difficulty", "medium")
        
        # For now, return a simple placeholder response
        return {
            "title": "Sample Quiz",
            "description": "This is a placeholder for the actual MDP quiz generation",
            "metadata": {
                "question_count": sum(question_counts.values()) if question_counts else 2
            },
            "questions": [
                {
                    "id": "q1",
                    "text": "This is a placeholder question",
                    "type": "mcq",
                    "bloom_level": "Understanding",
                    "difficulty": difficulty,
                    "options": [
                        {"id": "a", "text": "Option A"},
                        {"id": "b", "text": "Option B"},
                        {"id": "c", "text": "Option C"}
                    ]
                },
                {
                    "id": "q2",
                    "text": "This is another placeholder question",
                    "type": "true_false",
                    "bloom_level": "Remembering",
                    "difficulty": difficulty,
                    "options": [
                        {"id": "true", "text": "True"},
                        {"id": "false", "text": "False"}
                    ]
                }
            ]
        }
        
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=400, 
            content={"detail": "Invalid JSON"}
        )
    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Server error: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)