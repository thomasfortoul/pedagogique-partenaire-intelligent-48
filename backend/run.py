#!/usr/bin/env python3
"""
Run script for the Educational AI Assistant backend.
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

def main():
    """Run the FastAPI application with uvicorn."""
    # Load environment variables
    load_dotenv()
    
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY environment variable is not set.")
        print("Please set it in the .env file or environment variables.")
        sys.exit(1)
    
    # Get port from environment or use default
    port = int(os.getenv("PORT", "8000"))
    
    # Print startup message
    print(f"Starting Educational AI Assistant backend on port {port}...")
    print("Press Ctrl+C to stop the server.")
    
    # Run the server
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()