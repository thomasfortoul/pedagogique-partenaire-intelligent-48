# Educational AI Assistant Backend

A simplified backend architecture for educational AI assistants, designed to avoid complex agent frameworks and Pydantic validation issues.

## Design Principles

This architecture follows several key principles:

1. **Simplicity First**: Uses basic Python classes instead of complex validation frameworks
2. **Clear Separation of Concerns**: Distinct layers for models, services, and API
3. **Minimal Dependencies**: Relies only on FastAPI, OpenAI, and a few utility libraries
4. **Straightforward Request-Response Pattern**: Simple flow without complex workflows
5. **Easy State Management**: In-memory session store that can be replaced with a database
6. **Incremental Enhancement Path**: Designed to be extended piece by piece

## Project Structure

```
backend/
├── __init__.py          # Package definition
├── app.py               # Main FastAPI application
├── models.py            # Domain models using basic Python classes
├── services.py          # Business logic and AI interactions
├── simple_api.py        # Ultra-minimal API implementation
└── requirements.txt     # Project dependencies
```

## Components

### Models

Simple Python classes that represent our domain:
- `Message`: Represents a chat message
- `Conversation`: Collection of messages in a chat
- `LearningObjective`: Educational goals for a student
- `EducationalSession`: Combines conversations with learning objectives

### Services

Contains business logic:
- `AIService`: Handles interactions with OpenAI
- `EducationalService`: Manages educational sessions and processes messages

### API Layer

FastAPI application that exposes endpoints:
- `/chat`: Process chat messages
- `/sessions/{session_id}`: Get session details
- `/learning-objectives/{session_id}`: Add learning objectives

## Getting Started

1. **Set up environment**:
   - Create a virtual environment: `python -m venv venv`
   - Activate it: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
   - Install dependencies: `pip install -r requirements.txt`

2. **Set environment variables**:
   - Create a `.env` file with `OPENAI_API_KEY=your_api_key`

3. **Run the application**:
   - Run with uvicorn: `uvicorn app:app --reload --port 8000`
   - Or with the integrated runner: `python app.py`

4. **Test the API**:
   - Visit `http://localhost:8000/` to check if the API is running
   - Use a tool like Postman or curl to test the `/chat` endpoint

## API Usage Examples

### Chat Endpoint

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Can you explain photosynthesis?"}'
```

Response:
```json
{
  "session_id": "session_1234567890",
  "response": "Photosynthesis is the process...",
  "session_data": {
    "session_id": "session_1234567890",
    "learning_objectives": [
      {
        "id": "obj_1",
        "description": "Understand the basic process of photosynthesis",
        "status": "pending"
      }
    ],
    "metadata": {}
  }
}
```

## Extending the Architecture

This minimalist architecture is designed to be extended incrementally:

1. **Database Integration**: Replace the in-memory session store with a database
2. **Authentication**: Add user authentication and session management
3. **Advanced Learning Models**: Enhance the educational service with more sophisticated models
4. **Content Management**: Add resources and materials for the educational context
5. **Analytics**: Track student progress and learning patterns

## Future Enhancements

- Persistent storage with SQLite or PostgreSQL
- More sophisticated learning objective extraction
- User authentication and personalization
- Content recommendation based on learning objectives
- Progress tracking and reporting