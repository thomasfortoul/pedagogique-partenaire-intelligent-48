from dataclasses import dataclass, field
from typing import List, Optional, Dict

@dataclass
class Course:
    id: str
    title: str
    description: str
    level: Optional[str] = None
    documents: Optional[List[Dict]] = field(default_factory=list) # Assuming documents are a list of dicts for now

@dataclass
class UserProfile:
    userId: str
    name: Optional[str] = None
    email: Optional[str] = None
    courses: List[Course] = field(default_factory=list)

@dataclass
class TaskDocument:
    doc_id: str
    course_id: str
    doc_type: str  # e.g., "exercise", "quiz", "exam", "outline"
    content: str
    objectives: List[str]
    blooms_levels: List[str]

@dataclass
class UserInteractionState:
    user_id: str
    current_course: Optional[Course] = None # Store the full Course object
    user_profile: Optional[UserProfile] = None # Store the full UserProfile object
    current_task_id: Optional[str] = None
    chat_context: Dict = field(default_factory=dict)
    progress: Dict = field(default_factory=dict)