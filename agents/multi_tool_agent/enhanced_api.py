"""
Enhanced API for Pedagogical Agent System
Provides comprehensive session management and chat handling with proper ADK integration
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import logging
import traceback
from datetime import datetime

from .agentic_workflow_system import (
    initialize_session_for_api,
    handle_chat_message_enhanced,
    update_session_context,
    get_session_info,
    get_user_context_from_session,
    add_user_to_memory,
    add_course_to_memory,
    get_user_courses_from_memory,
    memory_service,
    session_service,
    APP_NAME
)
from .logger import log_agent_call, log_agent_response, log_error
from .models import Course, UserProfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Pedagogical Agent API",
    description="Enhanced API for course planning and assessment generation with proper session management",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------
# Request/Response Models
# ------------------------------------------------------------------------

class UserProfileData(BaseModel):
    userId: str
    name: str
    email: str
    preferences: Dict[str, Any] = Field(default_factory=dict)
    courses: List[Dict[str, Any]] = Field(default_factory=list)

class CourseData(BaseModel):
    id: str
    title: str
    description: str
    level: str

class SessionInitRequest(BaseModel):
    user_id: str
    user_profile: Optional[UserProfileData] = None
    current_course: Optional[CourseData] = None

class ChatMessageRequest(BaseModel):
    session_id: str
    message: str
    user_profile: Optional[UserProfileData] = None
    current_course: Optional[CourseData] = None

class SessionUpdateRequest(BaseModel):
    session_id: str
    user_profile: Optional[UserProfileData] = None
    current_course: Optional[CourseData] = None

class APIResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class ChatResponse(BaseModel):
    status: str
    response: str
    ui_updates: Dict[str, Any] = Field(default_factory=dict)
    session_id: str
    user_context: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# ------------------------------------------------------------------------
# Error Handling
# ------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return APIResponse(
        status="error",
        message="An internal server error occurred",
        data={"error": str(exc)}
    )

# ------------------------------------------------------------------------
# Health Check
# ------------------------------------------------------------------------

@app.get("/health", response_model=APIResponse)
async def health_check():
    """Health check endpoint"""
    return APIResponse(
        status="success",
        message="Pedagogical Agent API is running",
        data={
            "app_name": APP_NAME,
            "version": "2.0.0",
            "adk_enabled": True
        }
    )

# ------------------------------------------------------------------------
# Session Management Endpoints
# ------------------------------------------------------------------------

@app.post("/sessions/initialize", response_model=APIResponse)
async def initialize_session(request: SessionInitRequest):
    """
    Initialize a new session with user profile and course context
    """
    try:
        log_agent_call("initialize_session_api", {
            "user_id": request.user_id,
            "has_profile": request.user_profile is not None,
            "has_course": request.current_course is not None
        }, None)
        
        # Convert Pydantic models to dicts
        user_profile_data = request.user_profile.dict() if request.user_profile else None
        current_course_data = request.current_course.dict() if request.current_course else None
        
        # Initialize session
        result = initialize_session_for_api(
            user_id=request.user_id,
            user_profile_data=user_profile_data,
            current_course_data=current_course_data
        )
        
        if result["status"] == "success":
            log_agent_response("initialize_session_api", result, result["session_id"])
            return APIResponse(
                status="success",
                message="Session initialized successfully",
                data=result
            )
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to initialize session"))
            
    except Exception as e:
        log_error("initialize_session_api", e, None)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{session_id}", response_model=APIResponse)
async def get_session(session_id: str):
    """
    Get session information and context
    """
    try:
        result = get_session_info(session_id)
        
        if result["status"] == "success":
            return APIResponse(
                status="success",
                message="Session information retrieved",
                data=result
            )
        else:
            raise HTTPException(status_code=404, detail=result.get("message", "Session not found"))
            
    except Exception as e:
        log_error("get_session_api", e, session_id)
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/sessions/{session_id}/context", response_model=APIResponse)
async def update_session(session_id: str, request: SessionUpdateRequest):
    """
    Update session context with new user profile or course data
    """
    try:
        log_agent_call("update_session_api", {
            "session_id": session_id,
            "has_profile": request.user_profile is not None,
            "has_course": request.current_course is not None
        }, session_id)
        
        # Convert Pydantic models to dicts
        user_profile_data = request.user_profile.dict() if request.user_profile else None
        current_course_data = request.current_course.dict() if request.current_course else None
        
        result = update_session_context(
            session_id=session_id,
            user_profile_data=user_profile_data,
            current_course_data=current_course_data
        )
        
        if result["status"] == "success":
            log_agent_response("update_session_api", result, session_id)
            return APIResponse(
                status="success",
                message="Session context updated",
                data=result
            )
        else:
            raise HTTPException(status_code=400, detail=result.get("message", "Failed to update session"))
            
    except Exception as e:
        log_error("update_session_api", e, session_id)
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------------
# Chat Handling Endpoints
# ------------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatMessageRequest):
    """
    Handle chat message with enhanced context awareness
    """
    try:
        log_agent_call("handle_chat_api", {
            "session_id": request.session_id,
            "message": request.message[:100] + "..." if len(request.message) > 100 else request.message,
            "has_profile": request.user_profile is not None,
            "has_course": request.current_course is not None
        }, request.session_id)
        
        # Convert Pydantic models to proper objects if provided
        user_profile = None
        if request.user_profile:
            user_profile = UserProfile(
                userId=request.user_profile.userId,
                name=request.user_profile.name,
                email=request.user_profile.email,
                preferences=request.user_profile.preferences,
                courses=[Course(**course_data) for course_data in request.user_profile.courses]
            )
        
        current_course = None
        if request.current_course:
            current_course = Course(
                id=request.current_course.id,
                title=request.current_course.title,
                description=request.current_course.description,
                level=request.current_course.level
            )
        
        # Handle chat message with enhanced context
        result = handle_chat_message_enhanced(
            session_id=request.session_id,
            message=request.message,
            user_profile=user_profile,
            current_course=current_course
        )
        
        log_agent_response("handle_chat_api", {
            "response_length": len(result.get("response", "")),
            "ui_updates": list(result.get("ui_updates", {}).keys())
        }, request.session_id)
        
        return ChatResponse(
            status="success",
            response=result.get("response", ""),
            ui_updates=result.get("ui_updates", {}),
            session_id=result.get("session_id", request.session_id),
            user_context=result.get("user_context", {})
        )
        
    except Exception as e:
        log_error("handle_chat_api", e, request.session_id)
        # Return error response instead of raising HTTP exception for better UX
        return ChatResponse(
            status="error",
            response="I encountered an error processing your message. Please try again.",
            ui_updates={"error": str(e)},
            session_id=request.session_id,
            user_context={}
        )

# ------------------------------------------------------------------------
# Memory and History Endpoints
# ------------------------------------------------------------------------

@app.get("/users/{user_id}/history", response_model=APIResponse)
async def get_user_history(user_id: str, query: str = ""):
    """
    Get user's historical data and interactions
    """
    try:
        search_query = f"user_id:{user_id}" + (f" {query}" if query else "")
        results = memory_service.search_memory(search_query, similarity_top_k=10)
        
        return APIResponse(
            status="success",
            message="User history retrieved",
            data={
                "user_id": user_id,
                "query": search_query,
                "results": results,
                "count": len(results)
            }
        )
        
    except Exception as e:
        log_error("get_user_history_api", e, None)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{user_id}/courses", response_model=APIResponse)
async def get_user_courses(user_id: str):
    """
    Get user's courses from memory
    """
    try:
        courses = get_user_courses_from_memory(user_id)
        courses_data = [
            {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "level": course.level
            }
            for course in courses
        ]
        
        return APIResponse(
            status="success",
            message="User courses retrieved",
            data={
                "user_id": user_id,
                "courses": courses_data,
                "count": len(courses_data)
            }
        )
        
    except Exception as e:
        log_error("get_user_courses_api", e, None)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{user_id}/profile", response_model=APIResponse)
async def add_user_profile(user_id: str, profile: UserProfileData):
    """
    Add or update user profile in memory
    """
    try:
        user_profile = UserProfile(
            userId=profile.userId,
            name=profile.name,
            email=profile.email,
            preferences=profile.preferences,
            courses=[Course(**course_data) for course_data in profile.courses]
        )
        
        add_user_to_memory(user_id, user_profile)
        
        return APIResponse(
            status="success",
            message="User profile added to memory",
            data={
                "user_id": user_id,
                "profile_id": profile.userId,
                "name": profile.name
            }
        )
        
    except Exception as e:
        log_error("add_user_profile_api", e, None)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{user_id}/courses", response_model=APIResponse)
async def add_user_course(user_id: str, course: CourseData):
    """
    Add course to user's memory
    """
    try:
        course_obj = Course(
            id=course.id,
            title=course.title,
            description=course.description,
            level=course.level
        )
        
        add_course_to_memory(user_id, course_obj)
        
        return APIResponse(
            status="success",
            message="Course added to user memory",
            data={
                "user_id": user_id,
                "course_id": course.id,
                "course_title": course.title
            }
        )
        
    except Exception as e:
        log_error("add_user_course_api", e, None)
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------------
# Legacy Compatibility Endpoints
# ------------------------------------------------------------------------

@app.post("/run", response_model=Dict[str, Any])
async def legacy_run_endpoint(request: Dict[str, Any]):
    """
    Legacy endpoint for backward compatibility
    Redirects to the enhanced chat endpoint
    """
    try:
        # Extract data from legacy format
        session_id = request.get("session_id")
        message = request.get("message", "")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        # Use enhanced chat handler
        chat_request = ChatMessageRequest(
            session_id=session_id,
            message=message
        )
        
        result = await handle_chat(chat_request)
        
        # Return in legacy format
        return {
            "response": result.response,
            "ui_updates": result.ui_updates,
            "session_id": result.session_id,
            "status": result.status
        }
        
    except Exception as e:
        log_error("legacy_run_endpoint", e, request.get("session_id"))
        return {
            "response": "An error occurred processing your request.",
            "ui_updates": {},
            "session_id": request.get("session_id", ""),
            "status": "error",
            "error": str(e)
        }

# ------------------------------------------------------------------------
# Development and Testing Endpoints
# ------------------------------------------------------------------------

@app.get("/debug/sessions", response_model=APIResponse)
async def debug_list_sessions():
    """
    Debug endpoint to list all active sessions (development only)
    """
    try:
        # This is a simplified debug function
        # In a real implementation, you'd need proper session listing from ADK
        return APIResponse(
            status="success",
            message="Debug information retrieved",
            data={
                "note": "Session listing requires proper ADK implementation",
                "app_name": APP_NAME
            }
        )
        
    except Exception as e:
        log_error("debug_list_sessions", e, None)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/debug/sessions/{session_id}", response_model=APIResponse)
async def debug_delete_session(session_id: str):
    """
    Debug endpoint to delete a session (development only)
    """
    try:
        # Note: ADK session deletion would be implemented here
        return APIResponse(
            status="success",
            message=f"Session {session_id} deletion requested",
            data={"session_id": session_id}
        )
        
    except Exception as e:
        log_error("debug_delete_session", e, session_id)
        raise HTTPException(status_code=500, detail=str(e))

# ------------------------------------------------------------------------
# Application Startup
# ------------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("Starting Pedagogical Agent Enhanced API")
    logger.info(f"App Name: {APP_NAME}")
    logger.info("ADK Session and Memory services initialized")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("Shutting down Pedagogical Agent Enhanced API")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "enhanced_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )