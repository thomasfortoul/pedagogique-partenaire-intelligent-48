from dataclasses import dataclass, field
from typing import List, Optional, Dict

@dataclass
class Course:
    course_id: str
    name: str
    summary: str
    objectives: List[str]
    blooms_levels: List[str]

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
    current_course_id: Optional[str] = None
    current_task_id: Optional[str] = None
    chat_context: Dict = field(default_factory=dict)
    progress: Dict = field(default_factory=dict) 