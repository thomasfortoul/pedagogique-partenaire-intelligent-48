"""
Document Summarization Pipeline
A pipeline for document upload, analysis, and extraction of key information including objectives,
topics, and Bloom's taxonomy levels.
"""

import os
from typing import List, Dict, Any, Optional
from google.adk.agents import Agent, LlmAgent

from models import Course
from tools import extract_document_content, summarize_document

# ------------------------------------------------------------------------
# Document Processing Functions
# ------------------------------------------------------------------------

def process_document(document_path: str) -> Dict[str, Any]:
    """
    Process a document through the entire pipeline.
    
    Steps:
    1. Extract content from the document
    2. Summarize the content
    3. Extract objectives, topics, and Bloom's levels
    4. Store in structured format
    
    Args:
        document_path: Path to the document to process
        
    Returns:
        Dictionary with processing results
    """
    # Extract content
    content_result = extract_document_content(document_path)
    if content_result["status"] != "success":
        return content_result
    
    content = content_result["content"]
    
    # Summarize
    summary_result = summarize_document(content)
    if summary_result["status"] != "success":
        return summary_result
    
    summary = summary_result["summary"]
    
    # Extract objectives and metadata
    extraction_result = extract_objectives_and_metadata(content, summary)
    
    # Return all results
    return {
        "status": "success",
        "document_path": document_path,
        "content_length": len(content),
        "summary": summary,
        "objectives": extraction_result.get("objectives", []),
        "topics": extraction_result.get("topics", []),
        "blooms_levels": extraction_result.get("blooms_levels", []),
        "metadata": {
            **content_result.get("metadata", {}),
            **extraction_result.get("metadata", {})
        }
    }

def extract_objectives_and_metadata(content: str, summary: str) -> Dict[str, Any]:
    """
    Extract objectives, topics, and Bloom's levels from document content and summary.
    
    This is a placeholder implementation that would normally use the document_analysis_agent
    to extract this information using an LLM.
    
    Args:
        content: Full document content
        summary: Summarized document content
        
    Returns:
        Dictionary with extracted information
    """
    # In a real implementation, this would call the document_analysis_agent
    # For now, return placeholder data
    return {
        "status": "success",
        "objectives": [
            "Understand key course concepts and theories",
            "Apply educational methods appropriately",
            "Analyze pedagogical approaches critically",
            "Create effective learning activities",
            "Evaluate student outcomes systematically"
        ],
        "topics": [
            "Learning Theory",
            "Instructional Design",
            "Assessment Methods",
            "Educational Technology",
            "Inclusive Teaching"
        ],
        "blooms_levels": [
            "Understanding",
            "Application",
            "Analysis",
            "Creation",
            "Evaluation"
        ],
        "metadata": {
            "document_type": "syllabus",
            "course_level": "graduate",
            "estimated_duration_weeks": 12
        }
    }

def create_course_from_document(document_path: str, course_name: str, course_id: str = None) -> Optional[Course]:
    """
    Process a document and create a Course object from the extracted information.
    
    Args:
        document_path: Path to the document
        course_name: Name for the new course
        course_id: Optional ID for the course (will be generated if not provided)
        
    Returns:
        Course object or None if processing failed
    """
    # Process the document
    result = process_document(document_path)
    if result["status"] != "success":
        return None
    
    # Create a course ID if not provided
    if course_id is None:
        import uuid
        course_id = f"course-{uuid.uuid4()}"
    
    # Create and return the Course object
    return Course(
        course_id=course_id,
        name=course_name,
        summary=result["summary"],
        objectives=result["objectives"],
        blooms_levels=result["blooms_levels"]
    )

# ------------------------------------------------------------------------
# Document Analysis Agent
# ------------------------------------------------------------------------

def extract_objectives(document: str) -> Dict[str, Any]:
    """
    Tool for extracting learning objectives from a document.
    
    Args:
        document: Document content to analyze
    
    Returns:
        Dictionary with extracted objectives
    """
    # This is a placeholder - in a real implementation, this would use an LLM
    return {
        "status": "success",
        "objectives": [
            "Understand key concepts of educational psychology",
            "Apply learning theories to classroom practice",
            "Analyze student learning needs",
            "Design effective assessments",
            "Evaluate teaching effectiveness"
        ]
    }

def extract_topics(document: str) -> Dict[str, Any]:
    """
    Tool for extracting main topics from a document.
    
    Args:
        document: Document content to analyze
    
    Returns:
        Dictionary with extracted topics
    """
    # This is a placeholder - in a real implementation, this would use an LLM
    return {
        "status": "success",
        "topics": [
            "Learning Theories",
            "Instructional Methods",
            "Assessment Design",
            "Educational Technology",
            "Inclusive Teaching"
        ]
    }

def identify_bloom_levels(objectives: List[str]) -> Dict[str, Any]:
    """
    Tool for identifying Bloom's taxonomy levels in learning objectives.
    
    Args:
        objectives: List of learning objective statements
    
    Returns:
        Dictionary mapping objectives to Bloom's levels
    """
    # This is a placeholder - in a real implementation, this would use an LLM
    bloom_mapping = {}
    
    # Map keywords to Bloom's levels
    keywords = {
        "understand": "Understanding",
        "apply": "Application",
        "analyze": "Analysis",
        "design": "Creation",
        "evaluate": "Evaluation"
    }
    
    for obj in objectives:
        obj_lower = obj.lower()
        assigned_level = "Understanding"  # Default level
        
        for keyword, level in keywords.items():
            if keyword in obj_lower:
                assigned_level = level
                break
        
        bloom_mapping[obj] = assigned_level
    
    return {
        "status": "success",
        "bloom_mapping": bloom_mapping
    }

# Document Analysis Agent
document_analysis_agent = LlmAgent(
    name="document_analysis_agent",
    model="gemini-2.0-flash",
    description="Analyzes course documents to extract objectives, topics, and Bloom's levels.",
    instruction="""
    You are a document analysis specialist. Your task is to:
    1. Analyze educational documents (syllabi, lesson plans, etc.)
    2. Extract clear learning objectives and their Bloom's taxonomy levels
    3. Identify main topics and subject areas
    4. Determine the appropriate course level and structure
    5. Extract any assessment methods or requirements mentioned
    """,
    tools=[extract_objectives, extract_topics, identify_bloom_levels]
)

# Document Summarization Agent
document_summarization_agent = Agent(
    name="document_summarization_agent",
    model="gemini-2.0-flash",
    description="Creates concise summaries of course documents, highlighting key information.",
    instruction="""
    You are a document summarization specialist. Your task is to:
    1. Read and analyze educational documents
    2. Create concise, informative summaries
    3. Highlight key information about course structure, objectives, and assessment
    4. Format the summary in a clear, scannable way
    5. Ensure all critical information is preserved while reducing length
    """,
    tools=[summarize_document]
)

# Document Pipeline Agent for orchestration
document_pipeline_agent = Agent(
    name="document_pipeline_agent",
    model="gemini-2.0-flash",
    description="Orchestrates the document processing pipeline from upload to data extraction.",
    instruction="""
    You are a document pipeline coordinator. Your task is to:
    1. Process uploaded documents through the complete pipeline
    2. Coordinate content extraction, summarization, and analysis
    3. Verify the quality and completeness of extracted data
    4. Store results in the appropriate course context
    5. Provide a clear report of the processing results
    """,
    tools=[process_document, create_course_from_document]
)

# ------------------------------------------------------------------------
# Helper Functions for Document Testing
# ------------------------------------------------------------------------

def test_document_pipeline(document_path: str, course_name: str) -> Dict[str, Any]:
    """
    Test the document pipeline with a sample document.
    
    Args:
        document_path: Path to a test document
        course_name: Name for the test course
        
    Returns:
        Dictionary with test results
    """
    print(f"Testing document pipeline with {document_path}...")
    
    # Check if the file exists
    if not os.path.exists(document_path):
        return {
            "status": "error",
            "error_message": f"Test document not found: {document_path}"
        }
    
    # Process the document and create a course
    course = create_course_from_document(document_path, course_name)
    
    if course is None:
        return {
            "status": "error",
            "error_message": "Failed to create course from document"
        }
    
    # Return success with the created course
    return {
        "status": "success",
        "course": {
            "id": course.course_id,
            "name": course.name,
            "summary": course.summary,
            "objectives_count": len(course.objectives),
            "blooms_levels": course.blooms_levels
        }
    }

def create_sample_document(output_path: str) -> str:
    """
    Create a sample document for testing the pipeline.
    
    Args:
        output_path: Where to save the sample document
        
    Returns:
        Path to the created document
    """
    # Create a simple sample document
    content = """
    # Sample Course Syllabus
    
    ## Course Description
    This course introduces students to educational psychology and instructional design principles.
    Students will learn to apply learning theories to create effective educational experiences.
    
    ## Learning Objectives
    By the end of this course, students will be able to:
    - Understand key concepts of educational psychology
    - Apply learning theories to classroom practice
    - Analyze student learning needs
    - Design effective assessments
    - Evaluate teaching effectiveness
    
    ## Topics
    1. Learning Theories
    2. Instructional Methods
    3. Assessment Design
    4. Educational Technology
    5. Inclusive Teaching
    
    ## Assessment Methods
    - Weekly quizzes (20%)
    - Midterm project (30%)
    - Final assessment design project (40%)
    - Participation (10%)
    """
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Write the content to the file
    with open(output_path, 'w') as f:
        f.write(content)
        
    return output_path 