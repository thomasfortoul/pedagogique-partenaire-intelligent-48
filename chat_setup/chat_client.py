import requests
import json
import uuid

# --- Configuration ---
BASE_URL = "http://localhost:8000"
AGENT_NAME = "multi_tool_agent"  # Replace if your agent folder has a different name
USER_ID = f"user_{uuid.uuid4()}" # Generates a unique user ID
SESSION_ID = f"session_{uuid.uuid4()}" # Generates a unique session ID
# --- End Configuration ---

def create_session():
    """Creates a new session with the agent."""
    url = f"{BASE_URL}/apps/{AGENT_NAME}/users/{USER_ID}/sessions/{SESSION_ID}"
    headers = {"Content-Type": "application/json"}
    # Optional: Add initial state if needed
    # data = {"state": {"initial_key": "initial_value"}}
    # response = requests.post(url, headers=headers, json=data)
    response = requests.post(url, headers=headers) # No initial state for simplicity

    if response.status_code == 200:
        print(f"Session created successfully: {SESSION_ID} for user {USER_ID}")
        return response.json()
    elif response.status_code == 400 and "Session already exists" in response.text:
        print(f"Session {SESSION_ID} for user {USER_ID} already exists. Reusing.")
        return {"id": SESSION_ID, "appName": AGENT_NAME, "userId": USER_ID} # Simulate success
    else:
        print(f"Error creating session: {response.status_code}")
        print(response.text)
        return None

def send_message(message_text):
    """Sends a message to the agent and gets the response."""
    url = f"{BASE_URL}/run"
    headers = {"Content-Type": "application/json"}
    payload = {
        "app_name": AGENT_NAME,
        "user_id": USER_ID,
        "session_id": SESSION_ID,
        "new_message": {
            "role": "user",
            "parts": [{"text": message_text}]
        }
    }
    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending message: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response content: {e.response.text}")
        return None

def main():
    print("Attempting to create or reuse session...")
    session_info = create_session()

    if not session_info:
        print("Could not establish a session. Exiting.")
        return

    print(f"\nChatting with agent: {AGENT_NAME} (Session: {SESSION_ID})")
    print("Type 'quit' or 'exit' to end the chat.")

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit"]:
            print("Exiting chat.")
            break

        if not user_input.strip():
            continue

        agent_response_events = send_message(user_input)

        if agent_response_events:
            print("Agent:")
            for event in agent_response_events:
                if event.get("content") and event["content"].get("parts"):
                    for part in event["content"]["parts"]:
                        if "text" in part:
                            print(f"  {part['text']}")
                        elif "functionCall" in part:
                            print(f"  (Function Call: {part['functionCall']['name']} with args {part['functionCall']['args']})")
                        elif "functionResponse" in part:
                            print(f"  (Function Response: {part['functionResponse']['name']} - {part['functionResponse']['response'].get('status', 'N/A')})")
            print("-" * 20)
        else:
            print("No response or error from agent.")

if __name__ == "__main__":
    main()