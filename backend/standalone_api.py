"""
Ultra-minimal standalone API for Educational AI Assistant.
This file is completely self-contained with no dependencies on other modules.
"""

import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import time

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment
openai_api_key = os.getenv("OPENAI_API_KEY")

# Create FastAPI app
app = FastAPI(title="Minimal Educational AI API")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Function to call OpenAI API without using the client directly
async def call_openai_api(messages):
    """Call OpenAI API using the requests library instead of the client"""
    import requests
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {openai_api_key}"
    }
    
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": messages
    }
    
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        raise Exception(f"OpenAI API returned status code {response.status_code}: {response.text}")
    
    return response.json()

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"status": "Minimal Educational AI API is running"}

@app.post("/openai_test")
async def openai_test_endpoint(request: Request):
    """
    Simple endpoint to test OpenAI API.
    This matches what OpenAITest.tsx expects.
    """
    try:
        # Get request body
        body = await request.json()
        message = body.get("message")
        
        # Validate request
        if not message:
            return JSONResponse(
                status_code=400,
                content={"detail": "Message is required"}
            )
        
        # Check for OpenAI API key
        if not openai_api_key:
            return JSONResponse(
                status_code=500,
                content={"detail": "OpenAI API key not found"}
            )
        
        # Call OpenAI API
        response = await call_openai_api([
            {"role": "user", "content": message}
        ])
        
        # Return the response
        return {"response": response["choices"][0]["message"]["content"]}
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error: {str(e)}"}
        )

# Add a chat endpoint for the Generate.tsx page
@app.post("/chat")
async def chat(request: Request):
    """
    Simple chat endpoint for the Generate.tsx page.
    """
    try:
        # Get request body
        body = await request.json()
        message = body.get("message")
        session_id = body.get("session_id")
        
        # Validate request
        if not message:
            return JSONResponse(
                status_code=400,
                content={"detail": "Message is required"}
            )
        
        # Check for OpenAI API key
        if not openai_api_key:
            return JSONResponse(
                status_code=500,
                content={"detail": "OpenAI API key not found"}
            )
        
        # Call OpenAI API
        response = await call_openai_api([
            {"role": "system", "content": "You are an educational assistant helping students learn."},
            {"role": "user", "content": message}
        ])
        
        # Generate a session ID if not provided
        if not session_id:
            session_id = f"session_{int(time.time())}"
        
        # Return the response
        return {
            "session_id": session_id,
            "response": response["choices"][0]["message"]["content"]
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting minimal Educational AI API on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)