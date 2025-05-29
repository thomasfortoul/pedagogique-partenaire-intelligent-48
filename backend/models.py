"""
Simple domain models using basic Python classes instead of Pydantic.
"""

class Message:
    """A simple message class with role and content."""
    
    def __init__(self, role, content):
        self.role = role
        self.content = content
    
    def to_dict(self):
        """Convert to dictionary format for OpenAI API."""
        return {
            "role": self.role,
            "content": self.content
        }


class Conversation:
    """A simple conversation class to track message history."""
    
    def __init__(self, id=None):
        self.id = id
        self.messages = []
    
    def add_message(self, role, content):
        """Add a message to the conversation."""
        message = Message(role, content)
        self.messages.append(message)
        return message
    
    def get_message_history(self):
        """Get the message history in a format suitable for OpenAI API."""
        return [message.to_dict() for message in self.messages]


class LearningObjective:
    """A simple learning objective class."""
    
    def __init__(self, id=None, description=None, status="pending"):
        self.id = id
        self.description = description
        self.status = status  # pending, in_progress, completed
    
    def to_dict(self):
        """Convert to dictionary format."""
        return {
            "id": self.id,
            "description": self.description,
            "status": self.status
        }


class EducationalSession:
    """
    A session for educational interactions.
    Contains a conversation and learning objectives.
    """
    
    def __init__(self, session_id):
        self.session_id = session_id
        self.conversation = Conversation(id=session_id)
        self.learning_objectives = []
        self.metadata = {}
    
    def add_learning_objective(self, description):
        """Add a learning objective to the session."""
        objective_id = f"obj_{len(self.learning_objectives) + 1}"
        objective = LearningObjective(
            id=objective_id,
            description=description
        )
        self.learning_objectives.append(objective)
        return objective
    
    def to_dict(self):
        """Convert session to a dictionary for API responses."""
        return {
            "session_id": self.session_id,
            "learning_objectives": [obj.to_dict() for obj in self.learning_objectives],
            "metadata": self.metadata
        }