#!/usr/bin/env python3
"""
Ultra-simplified run script for the Educational AI Assistant backend.
"""

import uvicorn

# This will run the app directly as a standalone module
if __name__ == "__main__":
    print("Starting ultra-simplified Educational AI Assistant backend...")
    print("Press Ctrl+C to stop the server.")
    
    # Run the server directly without imports
    uvicorn.run(
        "simple_api:app",  # Use the simplest API implementation we created
        host="0.0.0.0",
        port=8000,
        reload=True
    )