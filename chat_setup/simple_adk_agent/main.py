from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Import the agent defined in agent.py
from agent import simple_agent # This is now weather_time_agent

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Simple ADK Agent Server",
    description="A FastAPI server to expose a basic Google ADK agent.",
    version="0.1.0"
)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"status": "Simple ADK Agent Server is running"}

@app.post("/agent_chat")
async def agent_chat(request: Request):
    """
    Endpoint to interact with the simple ADK agent.
    """
    try:
        body = await request.json()
        user_message = body.get("message")

        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Interact with the agent
        # The .run() method is for direct execution, but for a server,
        # we typically use the agent's internal processing or a specific
        # ADK server utility if available.
        # For now, let's simulate a response or use a simple agent method if available.
        # Based on the ADK quickstart, the agent itself is the callable.
        
        # The ADK documentation suggests using agent.run() for direct interaction,
        # but the error indicates it's not directly callable for a conversational turn.
        # For a FastAPI server, the ADK typically provides a way to serve the agent.
        # Let's assume for this minimal setup that the agent can be "called"
        # with a message and returns a string response.
        # If this fails, we'll need to look into ADK's specific server integration.

        # For a truly bare-bones agent without tools, the agent's instruction
        # should guide its response.
        # If simple_agent.run() still fails, we might need to use LlmAgent's
        # specific methods or a wrapper.
        
        # Let's try to use the agent directly as a callable, as implied by some ADK examples.
        # If this doesn't work, we'll need to use the ADK's server integration.
        
        # For a simple text-based agent, the 'run' method is often used for a single turn.
        # The previous error might have been due to the agent not being properly initialized
        # with a model, or the context in which it was run.
        # With FastAPI, the agent instance is persistent.

        # Let's try the .run() method again, as it's the standard way to interact with an Agent.
        # The previous error might have been misleading or context-dependent.
        agent_response = simple_agent.run(user_message)
        
        # The response from agent.run() can be complex (e.g., ToolCode, AgentCode, Text).
        # For simplicity, we'll convert it to a string.
        response_content = str(agent_response)

        return JSONResponse(
            status_code=200,
            content={"response": response_content}
        )

    except Exception as e:
        print(f"Error processing agent chat: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

if __name__ == "__main__":
    # Ensure necessary environment variables are set for Google ADK
    # For a simple local agent without specific cloud services, these might not be strictly
    # required for local execution, but it's good practice to be aware of them.
    # Example: os.environ["GOOGLE_CLOUD_PROJECT"] = "your-project-id"
    # Example: os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
    # Example: os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True" # If using Vertex AI models

    # The ADK documentation suggests that the agent itself can be served.
    # For a simple agent, we can just run the FastAPI app.
    
    # The ADK quickstart shows `agent.run()` for direct interaction.
    # For serving, the ADK provides `adk.server.run_server(agent)`.
    # However, to keep it "ultra bare bones" and use FastAPI directly,
    # we'll stick to a standard FastAPI app and call the agent's run method.
    # If the agent.run() method still fails, we'll need to use the ADK's
    # built-in server or a more complex interaction pattern.

    # Check if google.adk is installed
    try:
        import google.adk
    except ImportError:
        print("Error: google-adk package is not installed.")
        print("Please install it using: pip install google-adk")
        exit(1) # Exit if ADK is not installed

    port = int(os.getenv("PORT", "8000"))
    print(f"Starting Simple ADK Agent Server on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)