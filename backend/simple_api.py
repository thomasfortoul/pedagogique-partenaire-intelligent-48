import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI
app = FastAPI(title="Educational AI Assistant")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory session store (dictionary-based)
sessions = {}

@app.get("/")
async def root():
    return {"status": "Educational AI Assistant API is running"}

@app.post("/chat")
async def chat(request: Request):
    """
    Process a chat message and return a response.
    
    Handles the chat functionality without using Pydantic models.
    """
    try:
        # Parse JSON from request body manually
        body = await request.json()
        
        # Extract data with defaults and validation
        session_id = body.get("session_id")
        message = body.get("message")
        
        # Basic validation
        if not message:
            return JSONResponse(
                status_code=400,
                content={"error": "Message is required"}
            )
            
        # Create new session if none exists
        if not session_id or session_id not in sessions:
            session_id = f"session_{len(sessions) + 1}"
            sessions[session_id] = {
                "history": []
            }
        
        # Add message to history
        sessions[session_id]["history"].append({"role": "user", "content": message})
        
        # Get response from OpenAI (simple version)
        ai_response = await get_ai_response(sessions[session_id]["history"])
        
        # Add AI response to history
        sessions[session_id]["history"].append({"role": "assistant", "content": ai_response})
        
        # Return response
        return {
            "session_id": session_id,
            "response": ai_response
        }
        
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

async def get_ai_response(message_history):
    """
    Get a response from the OpenAI API.
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=message_history
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        return "I'm sorry, I encountered an error processing your request."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)