"""
Simple standalone test for consolidated context function
"""

import json
from typing import Dict, Any, Optional

class Course:
    def __init__(self, id: str, title: str, description: str, level: str = None, 
                 session: str = None, instructor: str = None, course_details_json: Dict = None):
        self.id = id
        self.title = title
        self.description = description
        self.level = level
        self.session = session
        self.instructor = instructor
        self.course_details_json = course_details_json

def build_consolidated_context_string(
    user_query: str, 
    agent_response: str, 
    current_course: Optional[Course], 
    course_details_json: Optional[Dict[str, Any]]
) -> str:
    """
    Build a consolidated context string with memory and course details for agent consumption.
    """
    context_parts = ["--- CONTEXT ---"]
    
    # Add memory information
    if user_query:
        context_parts.append(f"Most Recent User Query: {user_query}")
    if agent_response:
        context_parts.append(f"Agent's Last Response: {agent_response}")
    
    if user_query or agent_response:
        context_parts.append("")  # Empty line for separation
    
    # Add current course details
    if current_course:
        context_parts.append("--- CURRENT COURSE DETAILS ---")
        context_parts.append(f"Course_ID: {current_course.id}")
        context_parts.append(f"Course_Name: {current_course.title}")
        if current_course.level:
            context_parts.append(f"Course_Level: {current_course.level}")
        if current_course.description:
            context_parts.append(f"Course_Description_Summary: {current_course.description}")
        
        # Add session and instructor if available
        if current_course.session:
            context_parts.append(f"Course_Session: {current_course.session}")
        if current_course.instructor:
            context_parts.append(f"Course_Instructor: {current_course.instructor}")
        
        context_parts.append("")  # Empty line for separation
    
    # Add detailed course information (JSON)
    if course_details_json:
        context_parts.append("--- DETAILED COURSE INFORMATION (JSON) ---")
        try:
            formatted_json = json.dumps(course_details_json, indent=2)
            context_parts.append(formatted_json)
        except Exception:
            context_parts.append(str(course_details_json))
        context_parts.append("")  # Empty line for separation
    
    context_parts.append("--- END CONTEXT ---")
    
    return "\n".join(context_parts)

def test_consolidated_context():
    """Test that consolidated context is being built correctly"""
    
    # Create test course data
    test_course = Course(
        id="test-course-123",
        title="Introduction to Python Programming",
        description="A beginner course for learning Python programming",
        level="Beginner",
        session="Fall 2024",
        instructor="Dr. Smith",
        course_details_json={
            "learning_objectives": [
                "Understand Python syntax and basic programming concepts",
                "Write simple Python programs",
                "Use Python data structures effectively"
            ],
            "modules": [
                {"name": "Getting Started", "duration": "2 weeks"},
                {"name": "Data Types", "duration": "3 weeks"},
                {"name": "Control Flow", "duration": "2 weeks"}
            ],
            "assessment_methods": ["quizzes", "assignments", "final_project"]
        }
    )
    
    # Test consolidated context string building
    user_query = "How can I improve my Python skills?"
    agent_response = "I recommend starting with the basic syntax and practicing with simple exercises."
    
    context_string = build_consolidated_context_string(
        user_query=user_query,
        agent_response=agent_response,
        current_course=test_course,
        course_details_json=test_course.course_details_json
    )
    
    print("=== CONSOLIDATED CONTEXT TEST ===")
    print(context_string)
    print("\n=== VERIFICATION ===")
    
    # Verify the context contains expected elements
    assert "Most Recent User Query:" in context_string
    assert user_query in context_string
    assert "Agent's Last Response:" in context_string
    assert agent_response in context_string
    assert "Course_ID: test-course-123" in context_string
    assert "Course_Name: Introduction to Python Programming" in context_string
    assert "Course_Level: Beginner" in context_string
    assert "Course_Session: Fall 2024" in context_string
    assert "Course_Instructor: Dr. Smith" in context_string
    assert "DETAILED COURSE INFORMATION (JSON)" in context_string
    assert "learning_objectives" in context_string
    
    print("✓ All context elements present")
    print("✓ Course details properly formatted")
    print("✓ Memory information included")
    print("✓ JSON course details included")
    
    return True

def test_empty_context():
    """Test with empty/minimal data"""
    
    print("\n=== EMPTY CONTEXT TEST ===")
    
    context_string = build_consolidated_context_string(
        user_query="",
        agent_response="",
        current_course=None,
        course_details_json=None
    )
    
    print(context_string)
    
    assert "--- CONTEXT ---" in context_string
    assert "--- END CONTEXT ---" in context_string
    
    print("✓ Empty context handled correctly")
    return True

def test_partial_context():
    """Test with partial data"""
    
    print("\n=== PARTIAL CONTEXT TEST ===")
    
    simple_course = Course(
        id="simple-course",
        title="Basic Math",
        description="Elementary mathematics"
    )
    
    context_string = build_consolidated_context_string(
        user_query="What is 2+2?",
        agent_response="",
        current_course=simple_course,
        course_details_json=None
    )
    
    print(context_string)
    
    assert "Most Recent User Query: What is 2+2?" in context_string
    assert "Course_ID: simple-course" in context_string
    assert "Course_Name: Basic Math" in context_string
    
    print("✓ Partial context handled correctly")
    return True

if __name__ == "__main__":
    print("Testing Consolidated Context Implementation")
    print("=" * 50)
    
    try:
        # Test 1: Full context
        test_consolidated_context()
        
        # Test 2: Empty context
        test_empty_context()
        
        # Test 3: Partial context
        test_partial_context()
        
        print("\n" + "=" * 50)
        print("🎉 ALL TESTS PASSED! Consolidated context implementation is working correctly.")
        print("\nThe implementation successfully:")
        print("- Builds formatted context strings with course details")
        print("- Includes conversation memory (user query + agent response)")
        print("- Formats course information from database")
        print("- Handles JSON course details properly")
        print("- Works with partial or empty data")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()