import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import openai
from dotenv import load_dotenv

app = FastAPI()

# Load environment variables from .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

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
    return {"message": "Simple OpenAI Test Backend is running"}

# To run this application, use:
# uvicorn simple_main:app --reload --port 8000
# from the 'backend' directory.