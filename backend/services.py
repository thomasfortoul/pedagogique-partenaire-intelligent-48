"""
Service layer for the educational AI assistant.
Handles interactions with AI models and educational logic.
"""

import os
import time
import openai
import json

# Use absolute imports instead of relative
from models import EducationalSession, Message

# Global session store (simple in-memory implementation)
# In a production environment, this would be replaced with a database
SESSION_STORE = {}

class AIService:
    """Service for interacting with OpenAI API."""
    
    def __init__(self, api_key=None):
        """Initialize with API key from env or parameter."""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        openai.api_key = self.api_key
    
    async def get_completion(self, messages, model="gpt-3.5-turbo"):
        """Get a completion from OpenAI."""
        try:
            response = openai.chat.completions.create(
                model=model,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error getting completion: {str(e)}")
            raise


class EducationalService:
    """Service for educational assistance functionality."""
    
    def __init__(self, ai_service=None):
        """Initialize with an AIService instance."""
        self.ai_service = ai_service or AIService()
    
    def get_or_create_session(self, session_id=None):
        """Get an existing session or create a new one."""
        if session_id and session_id in SESSION_STORE:
            return SESSION_STORE[session_id]
        
        # Create new session with generated ID if none provided
        new_id = session_id or f"session_{int(time.time())}"
        session = EducationalSession(new_id)
        SESSION_STORE[new_id] = session
        return session
    
    async def process_message(self, session_id, message_text):
        """Process a user message and generate a response."""
        # Get or create session
        session = self.get_or_create_session(session_id)
        
        # Add user message to conversation
        session.conversation.add_message("user", message_text)
        
        # Prepare messages for AI
        messages = session.conversation.get_message_history()
        
        # Add system message for educational context
        system_message = {
            "role": "system",
            "content": (
                "You are an educational assistant helping a student learn. "
                "Provide clear, helpful responses that encourage understanding. "
                "If appropriate, identify learning objectives and break down complex topics."
            )
        }
        
        # Insert system message at the beginning
        messages.insert(0, system_message)
        
        # Get AI response
        response_text = await self.ai_service.get_completion(messages)
        
        # Process response for learning objectives (simple version)
        self._extract_learning_objectives(session, response_text)
        
        # Add assistant response to conversation
        session.conversation.add_message("assistant", response_text)
        
        # Return response with session info
        return {
            "session_id": session.session_id,
            "response": response_text,
            "session_data": session.to_dict()
        }
    
    def _extract_learning_objectives(self, session, text):
        """
        Simple function to extract potential learning objectives from text.
        This is a placeholder - in a real implementation, this would be more sophisticated.
        """
        # Simple heuristic: look for phrases that might indicate learning objectives
        lower_text = text.lower()
        indicators = [
            "you will learn", 
            "learning objective", 
            "by the end", 
            "should understand",
            "key concept"
        ]
        
        # Check if any indicators are in the text
        if any(indicator in lower_text for indicator in indicators):
            # Simple extraction: use the sentence containing the indicator
            sentences = text.split('.')
            for sentence in sentences:
                if any(indicator in sentence.lower() for indicator in indicators):
                    # Clean up the sentence and add it as an objective
                    clean_sentence = sentence.strip()
                    if clean_sentence:
                        session.add_learning_objective(clean_sentence)