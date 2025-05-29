#!/usr/bin/env python3
"""
Ultra-minimal run script for the standalone API.
"""

import uvicorn

if __name__ == "__main__":
    print("Starting standalone Educational AI API...")
    print("This is a completely self-contained API with no dependencies on other modules.")
    print("Press Ctrl+C to stop the server.")
    
    # Run the standalone API
    uvicorn.run(
        "standalone_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )