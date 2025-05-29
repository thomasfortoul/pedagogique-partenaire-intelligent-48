# Enhanced Session Management with ADK Integration

## Overview

This document describes the enhanced session management system that implements proper Google ADK (Agent Development Kit) patterns for data persistence, session state management, and memory service integration. The system ensures reliable data transfer to the root agent and maintains user context across interactions.

## Key Improvements

### 1. ADK-Compliant Session State Management

The system now uses Google ADK's proper session state patterns with:

- **Proper State Prefixes**: Uses `user:`, `app:`, and `temp:` prefixes for different scopes
- **EventActions Pattern**: Updates state via `EventActions.state_delta` with `append_event`
- **Serializable Data**: Stores only basic, serializable types in session state
- **Thread-Safe Updates**: Ensures concurrent access safety

### 2. Enhanced Memory Service Integration

- **Long-term Storage**: User profiles and course data persist across sessions
- **Searchable Knowledge**: Memory service allows querying historical data
- **Structured Metadata**: Rich metadata for effective retrieval

### 3. Context-Aware Root Agent

- **Session Context Tools**: Root agent can access current session context
- **User History Tools**: Root agent can search user's historical interactions
- **Informed Decision Making**: Personalized responses based on user profile and course history

## Core Components

### Session State Structure

```python
# Session-specific state (no prefix)
current_step: str                # Current workflow step
chat_context: Dict[str, Any]     # Current conversation context
current_task_id: str            # Active task identifier

# User-scoped state (user: prefix - persists across sessions)
user:profile_id: str            # User's unique identifier
user:name: str                  # User's display name
user:email: str                 # User's email address
user:preferences: str           # JSON-encoded user preferences

# Course state (session-specific)
current_course_id: str          # Current course identifier
current_course_title: str       # Course title
current_course_description: str # Course description
current_course_level: str       # Course level/difficulty

# App-level state (app: prefix - shared across all users)
app:version: str                # Application version
app:supported_languages: str    # JSON array of supported languages

# Temporary state (temp: prefix - never persisted)
temp:last_interaction: str      # Last user-agent interaction summary
temp:validation_needed: bool    # Temporary processing flags
```

### Memory Service Data Structure

User profiles and courses are stored in the memory service with searchable content:

```python
# User Profile in Memory
{
    "type": "user_profile",
    "user_id": "user123",
    "content": "User profile for John Doe (john@example.com). Courses: Math 101, Physics 201",
    "metadata": {
        "profile": {...},  # Full UserProfile object
        "courses": [...]   # Array of Course objects
    }
}

# Course in Memory
{
    "type": "course", 
    "user_id": "user123",
    "content": "Course: Math 101 - Introduction to Calculus. Level: Beginner",
    "metadata": {
        "course": {...}    # Full Course object
    }
}
```

## API Changes

### New Enhanced Endpoints

#### Session Management

```http
POST /sessions/initialize
{
    "user_id": "user123",
    "user_profile": {
        "userId": "user123",
        "name": "John Doe",
        "email": "john@example.com",
        "preferences": {"language": "en"},
        "courses": [...]
    },
    "current_course": {
        "id": "course456",
        "title": "Math 101",
        "description": "Introduction to Calculus",
        "level": "Beginner"
    }
}
```

```http
GET /sessions/{session_id}
PUT /sessions/{session_id}/context
```

#### Enhanced Chat

```http
POST /chat
{
    "session_id": "session123",
    "message": "Help me create a quiz",
    "user_profile": {...},  # Optional - updates context if provided
    "current_course": {...} # Optional - updates context if provided
}
```

#### Memory and History

```http
GET /users/{user_id}/history?query=quiz
GET /users/{user_id}/courses
POST /users/{user_id}/profile
POST /users/{user_id}/courses
```

### Enhanced Response Format

```json
{
    "status": "success",
    "response": "I'll help you create a quiz for Math 101...",
    "ui_updates": {
        "current_agent_id": "assessment_generator",
        "taskParameters": {...}
    },
    "session_id": "session123",
    "user_context": {
        "user_id": "user123",
        "user_profile": {...},
        "current_course": {...},
        "current_step": "objectives_captured",
        "chat_context": {...}
    },
    "timestamp": "2024-01-15T10:30:00Z"
}
```

## Usage Examples

### 1. Initialize Session with User Context

```python
from agentic_workflow_system import initialize_session_with_user_context
from models import UserProfile, Course

# Create user profile
user_profile = UserProfile(
    userId="user123",
    name="John Doe", 
    email="john@example.com",
    preferences={"language": "en", "difficulty": "intermediate"},
    courses=[...]
)

# Create course
current_course = Course(
    id="course456",
    title="Math 101",
    description="Introduction to Calculus",
    level="Beginner"
)

# Initialize session
session_id = initialize_session_with_user_context(
    user_id="user123",
    user_profile=user_profile,
    current_course=current_course
)
```

### 2. Handle Chat with Context

```python
from agentic_workflow_system import handle_chat_message_enhanced

result = handle_chat_message_enhanced(
    session_id=session_id,
    message="Create a quiz on derivatives",
    user_profile=user_profile,  # Optional - updates if provided
    current_course=current_course  # Optional - updates if provided
)

print(f"Agent response: {result['response']}")
print(f"UI updates: {result['ui_updates']}")
print(f"User context: {result['user_context']}")
```

### 3. Update Session Context

```python
from agentic_workflow_system import update_session_state_adk

# Update chat context
update_session_state_adk(
    session_id=session_id,
    state_updates={
        "chat_context": {"quiz_topic": "derivatives", "difficulty": "medium"},
        "current_step": "assessment_created"
    },
    event_author="agent"
)
```

### 4. Retrieve User Context

```python
from agentic_workflow_system import get_user_context_from_session

context = get_user_context_from_session(session_id)
print(f"Current user: {context['user_profile']['name']}")
print(f"Current course: {context['current_course']['title']}")
print(f"Workflow step: {context['current_step']}")
```

## Root Agent Enhancement

The root agent now has access to context tools:

```python
def create_root_agent_with_context():
    def get_session_context_tool(session_id: str):
        """Access current session context including user profile and course"""
        return get_user_context_from_session(session_id)
    
    def get_user_history_tool(user_id: str, query: str = ""):
        """Search user's historical data and interactions"""
        return memory_service.search_memory(f"user_id:{user_id} {query}")
    
    return Agent(
        name="pedagogical_orchestrator_enhanced",
        tools=[get_session_context_tool, get_user_history_tool],
        instruction="""
        Always start by retrieving session context to understand:
        - User profile and preferences
        - Current course details
        - Workflow state and history
        
        Use this context to personalize responses and maintain continuity.
        """
    )
```

## Migration Guide

### From Legacy System

1. **Replace Session Initialization**:
   ```python
   # Old
   session_id = initialize_session(user_id)
   
   # New
   session_id = initialize_session_with_user_context(
       user_id=user_id,
       user_profile=user_profile,
       current_course=current_course
   )
   ```

2. **Replace State Updates**:
   ```python
   # Old
   update_session_state(session_id, new_state, data)
   
   # New
   update_session_state_adk(session_id, state_updates, "system")
   ```

3. **Replace Chat Handling**:
   ```python
   # Old
   result = handle_chat_message(session_id, message)
   
   # New
   result = handle_chat_message_enhanced(
       session_id, message, user_profile, current_course
   )
   ```

### API Migration

Update API calls to use new endpoints:

```javascript
// Old
fetch('/run', {
    method: 'POST',
    body: JSON.stringify({
        session_id: sessionId,
        message: message
    })
})

// New - Enhanced context
fetch('/chat', {
    method: 'POST', 
    body: JSON.stringify({
        session_id: sessionId,
        message: message,
        user_profile: userProfile,
        current_course: currentCourse
    })
})
```

## Best Practices

### 1. Session State Design

- **Minimalism**: Store only essential, dynamic data
- **Serialization**: Use basic, serializable types (string, number, boolean, simple objects)
- **Proper Prefixes**: Use appropriate prefixes for scope and persistence
- **Event-Driven Updates**: Always update via `EventActions.state_delta`

### 2. Memory Service Usage

- **Rich Metadata**: Include comprehensive metadata for effective retrieval
- **Searchable Content**: Write descriptive content for search functionality
- **User Scoping**: Always include user_id in metadata for proper filtering

### 3. Context Management

- **Early Retrieval**: Get session context early in request processing
- **Context Passing**: Pass full context to agents for informed decisions
- **State Consistency**: Update state immediately after context changes

### 4. Error Handling

- **Graceful Degradation**: Continue operation even if context retrieval fails
- **Error State Management**: Use proper ADK patterns for error state updates
- **Comprehensive Logging**: Log all context operations for debugging

## Running the Enhanced System

### Start Enhanced API Server

```bash
# From the multi_tool_agent directory
python main.py api --host 0.0.0.0 --port 8000 --reload --log-level info
```

### Test Session Management

```bash
# Initialize session
curl -X POST http://localhost:8000/sessions/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "user_profile": {
      "userId": "user123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'

# Send chat message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session_abc123",
    "message": "Help me create a quiz"
  }'
```

## Troubleshooting

### Common Issues

1. **Session Not Found**: Ensure session was properly initialized with `initialize_session_with_user_context`
2. **Context Missing**: Verify user profile and course data are properly structured
3. **State Updates Failing**: Check that state updates use proper ADK `EventActions` pattern
4. **Memory Search Empty**: Confirm data was added to memory service with proper metadata

### Debug Endpoints

- `GET /debug/sessions` - List active sessions
- `DELETE /debug/sessions/{session_id}` - Delete session
- `GET /users/{user_id}/history` - View user's memory data

This enhanced system provides robust, ADK-compliant session management that ensures reliable data transfer to agents while maintaining user context across interactions.