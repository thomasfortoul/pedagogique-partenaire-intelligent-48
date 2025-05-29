"""
Simple test script for the Educational AI Assistant API.
This can be run to test the functionality without needing a frontend.
"""

import asyncio
import json
import sys
import os

# Add the current directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_chat_api():
    """Test the chat endpoint with a simple request."""
    import aiohttp
    
    print("Testing Educational AI Assistant API...")
    
    # Test API connection
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        # Test root endpoint
        print("\nTesting root endpoint...")
        async with session.get(f"{base_url}/") as response:
            if response.status == 200:
                data = await response.json()
                print(f"Root endpoint response: {data}")
            else:
                print(f"Error: {response.status}")
                return
        
        # Test chat endpoint
        print("\nTesting chat endpoint...")
        test_message = "Can you explain what photosynthesis is in simple terms?"
        
        async with session.post(
            f"{base_url}/chat",
            json={"message": test_message}
        ) as response:
            if response.status == 200:
                data = await response.json()
                print(f"\nSession ID: {data.get('session_id')}")
                print(f"\nAI Response: {data.get('response')}")
                
                # Check if learning objectives were identified
                session_data = data.get('session_data', {})
                objectives = session_data.get('learning_objectives', [])
                
                if objectives:
                    print("\nIdentified Learning Objectives:")
                    for obj in objectives:
                        print(f"- {obj.get('description')}")
                else:
                    print("\nNo learning objectives identified.")
                
                # Save the session ID for future tests
                return data.get('session_id')
            else:
                print(f"Error: {response.status}")
                try:
                    error_data = await response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Error details: {await response.text()}")
                return None

async def test_follow_up_message(session_id):
    """Test sending a follow-up message in the same session."""
    import aiohttp
    
    if not session_id:
        print("No session ID available for follow-up test.")
        return
    
    print(f"\nTesting follow-up message with session ID: {session_id}")
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        test_message = "What are the key components needed for photosynthesis?"
        
        async with session.post(
            f"{base_url}/chat",
            json={"session_id": session_id, "message": test_message}
        ) as response:
            if response.status == 200:
                data = await response.json()
                print(f"\nAI Response: {data.get('response')}")
                
                # Check if new learning objectives were identified
                session_data = data.get('session_data', {})
                objectives = session_data.get('learning_objectives', [])
                
                if objectives:
                    print("\nCurrent Learning Objectives:")
                    for obj in objectives:
                        print(f"- {obj.get('description')}")
            else:
                print(f"Error: {response.status}")
                try:
                    error_data = await response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Error details: {await response.text()}")

async def main():
    """Run all tests in sequence."""
    # Test initial chat
    session_id = await test_chat_api()
    
    # If we got a session ID, test a follow-up message
    if session_id:
        await test_follow_up_message(session_id)

if __name__ == "__main__":
    # Check if aiohttp is installed
    try:
        import aiohttp
    except ImportError:
        print("Error: aiohttp package is required for this test.")
        print("Please install it with: pip install aiohttp")
        sys.exit(1)
    
    # Run the tests
    asyncio.run(main())