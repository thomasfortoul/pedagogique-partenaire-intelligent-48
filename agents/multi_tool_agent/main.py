"""
Main entry point for the Agentic Workflow System

This file integrates all components of the system and provides a simple entry point
for running the various agents and workflows.
"""

import os
import sys
import json
import argparse
from typing import Dict, Any, List
from .logger import logger, log_error

from google.adk.agents import Agent
from google.adk.runners import Runner

# Import our components
from models import Course, TaskDocument, UserInteractionState
import agentic_workflow_system as aws
import document_pipeline as dp
import tools

# Import enhanced API
try:
    from enhanced_api import app as enhanced_api_app
    ENHANCED_API_AVAILABLE = True
except ImportError:
    ENHANCED_API_AVAILABLE = False
    logger.warning("Enhanced API not available. Install FastAPI and uvicorn to use API mode.")

def setup_argparse() -> argparse.ArgumentParser:
    """Set up command line argument parsing."""
    parser = argparse.ArgumentParser(description='Agentic Workflow System for Course Planning and Assessment')
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Document pipeline command
    doc_parser = subparsers.add_parser('document', help='Process a document')
    doc_parser.add_argument('document_path', help='Path to the document to process')
    doc_parser.add_argument('--course-name', help='Name for the course', default='New Course')
    
    # Course planning command
    plan_parser = subparsers.add_parser('plan', help='Plan a course')
    plan_parser.add_argument('--objectives', help='Comma-separated list of learning objectives')
    plan_parser.add_argument('--duration', help='Course duration in weeks', type=int, default=12)
    
    # Assessment generation command
    assess_parser = subparsers.add_parser('assessment', help='Generate assessments')
    assess_parser.add_argument('--course-id', help='ID of the course')
    assess_parser.add_argument('--type', help='Type of assessment (quiz, exam, project)', default='quiz')
    
    # Interactive mode command
    interactive_parser = subparsers.add_parser('interactive', help='Start interactive mode')
    
    # Test mode command
    test_parser = subparsers.add_parser('test', help='Run tests')
    test_parser.add_argument('--test-type', help='Type of test to run', choices=['document', 'all'], default='all')
    
    # Enhanced API server command
    api_parser = subparsers.add_parser('api', help='Start enhanced API server')
    api_parser.add_argument('--host', help='Host to bind to', default='0.0.0.0')
    api_parser.add_argument('--port', help='Port to bind to', type=int, default=8000)
    api_parser.add_argument('--reload', help='Enable auto-reload', action='store_true')
    api_parser.add_argument('--log-level', help='Log level', choices=['debug', 'info', 'warning', 'error'], default='info')
    
    return parser

def process_document_command(args: argparse.Namespace) -> None:
    """Handle the document processing command."""
    logger.info(f"Processing document: {args.document_path}")
    
    result = dp.process_document(args.document_path)
    
    if result["status"] == "success":
        logger.info(f"Document processed successfully")
        logger.info(f"Summary: {result['summary']}")
        logger.info(f"Objectives ({len(result['objectives'])}):")
        for i, obj in enumerate(result['objectives']):
            logger.info(f"  {i+1}. {obj}")
        
        logger.info(f"Topics ({len(result['topics'])}):")
        for i, topic in enumerate(result['topics']):
            logger.info(f"  {i+1}. {topic}")
        
        logger.info(f"Bloom's Levels: {', '.join(result['blooms_levels'])}")
        
        # Create a course
        course = dp.create_course_from_document(args.document_path, args.course_name)
        if course:
            logger.info(f"Created course: {course.name} (ID: {course.course_id})")
            
            # Save course to a JSON file for later use
            course_file = f"course_{course.course_id}.json"
            with open(course_file, 'w') as f:
                # Convert dataclass to dict
                course_dict = {
                    "course_id": course.course_id,
                    "name": course.name,
                    "summary": course.summary,
                    "objectives": course.objectives,
                    "blooms_levels": course.blooms_levels
                }
                json.dump(course_dict, f, indent=2)
                
            logger.info(f"Course saved to {course_file}")
    else:
        log_error("process_document_command", Exception(result.get('error_message', 'Unknown error')))

def plan_course_command(args: argparse.Namespace) -> None:
    """Handle the course planning command."""
    logger.info("Planning course...")
    
    # Get objectives from args or use defaults
    if args.objectives:
        objectives = [obj.strip() for obj in args.objectives.split(',')]
    else:
        objectives = [
            "Understand key pedagogical concepts and theories",
            "Apply instructional design principles to course planning",
            "Analyze student needs and learning styles",
            "Create aligned assessments using Bloom's taxonomy",
            "Evaluate learning outcomes and iterate on course design"
        ]
    
    logger.info(f"Planning course with {len(objectives)} objectives for {args.duration} weeks")
    
    # Use the syllabus planner tool
    schedule_constraints = {
        "start_date": "2023-09-01",
        "end_date": "2023-12-15",
        "holidays": ["2023-11-24"]
    }
    
    result = tools.generate_syllabus(objectives, args.duration, schedule_constraints)
    
    if result["status"] == "success":
        syllabus = result["syllabus"]
        logger.info(f"Generated syllabus: {syllabus['title']}")
        logger.info(f"Modules: {len(syllabus['modules'])}")
        
        for module in syllabus['modules']:
            logger.info(f"  Module {module['id']}: {module['title']}")
            logger.info(f"    Primary objective: {module['primary_objective']}")
            logger.info(f"    Sessions: {len(module['sessions'])}")
        
        # Save syllabus to a JSON file
        syllabus_file = "syllabus.json"
        with open(syllabus_file, 'w') as f:
            json.dump(syllabus, f, indent=2)
            
        logger.info(f"Syllabus saved to {syllabus_file}")
    else:
        log_error("plan_course_command", Exception(result.get('error_message', 'Unknown error')))

def generate_assessment_command(args: argparse.Namespace) -> None:
    """Handle the assessment generation command."""
    logger.info(f"Generating {args.type} assessment...")
    
    # Try to load course from a file if course_id is provided
    course = None
    if args.course_id:
        course_file = f"course_{args.course_id}.json"
        if os.path.exists(course_file):
            with open(course_file, 'r') as f:
                course_dict = json.load(f)
                course = Course(
                    course_id=course_dict["course_id"],
                    name=course_dict["name"],
                    summary=course_dict["summary"],
                    objectives=course_dict["objectives"],
                    blooms_levels=course_dict["blooms_levels"]
                )
                logger.info(f"Loaded course: {course.name}")
    
    # Use default objectives if no course was loaded
    if not course:
        logger.info("No course specified or found, using default objectives")
        objectives = [
            {
                "text": "Understand key pedagogical concepts and theories",
                "bloom_level": "Understanding"
            },
            {
                "text": "Apply instructional design principles to course planning",
                "bloom_level": "Application"
            },
            {
                "text": "Analyze student needs and learning styles",
                "bloom_level": "Analysis"
            },
            {
                "text": "Create aligned assessments using Bloom's taxonomy",
                "bloom_level": "Creation"
            },
            {
                "text": "Evaluate learning outcomes and iterate on course design",
                "bloom_level": "Evaluation"
            }
        ]
    else:
        # Convert course objectives to the format needed by the quiz generator
        objectives = []
        bloom_keywords = {
            "understand": "Understanding",
            "apply": "Application",
            "analyze": "Analysis",
            "create": "Creation",
            "evaluate": "Evaluation",
            "remember": "Remembering"
        }
        
        for obj in course.objectives:
            obj_lower = obj.lower()
            level = next((bloom_keywords[kw] for kw in bloom_keywords if kw in obj_lower), "Understanding")
            objectives.append({
                "text": obj,
                "bloom_level": level
            })
    
    # Define question counts based on assessment type
    if args.type == "quiz":
        question_counts = {"mcq": 5, "true_false": 3, "short_answer": 2}
        difficulty = "medium"
    elif args.type == "exam":
        question_counts = {"mcq": 10, "true_false": 5, "short_answer": 3, "essay": 2}
        difficulty = "hard"
    else:  # project
        logger.warning("Project generation not yet implemented")
        return
    
    # Generate the quiz/exam
    result = tools.generate_quiz(objectives, question_counts, difficulty)
    
    if result["status"] == "success":
        quiz = result["quiz"]
        logger.info(f"Generated {quiz['title']}")
        logger.info(f"Questions: {quiz['metadata']['question_count']}")
        
        # Display a few sample questions
        logger.info("\nSample questions:")
        for i, question in enumerate(quiz['questions'][:3]):
            logger.info(f"  Q{i+1}: {question['text']}")
            if question['type'] == 'mcq':
                for option in question['options']:
                    logger.info(f"    {option['id']}: {option['text']}")
                logger.info(f"    Answer: {quiz['answer_key'][question['id']]}")
        
        # Save to a file
        assessment_file = f"{args.type}_{quiz['metadata']['generated_at'].replace(':', '-')}.json"
        with open(assessment_file, 'w') as f:
            json.dump(quiz, f, indent=2)
            
        logger.info(f"\nAssessment saved to {assessment_file}")
    else:
        log_error("generate_assessment_command", Exception(result.get('error_message', 'Unknown error')))

def run_tests(args: argparse.Namespace) -> None:
    """Run tests for the system."""
    logger.info("Running tests...")
    
    if args.test_type in ['document', 'all']:
        # Test document pipeline
        logger.info("\nTesting document pipeline:")
        sample_path = os.path.join("tests", "sample_syllabus.txt")
        dp.create_sample_document(sample_path)
        
        result = dp.test_document_pipeline(sample_path, "Test Course")
        
        if result["status"] == "success":
            logger.info("✅ Document pipeline test passed")
            logger.info(f"  Created course: {result['course']['name']}")
            logger.info(f"  Objectives: {result['course']['objectives_count']}")
            logger.info(f"  Bloom's levels: {', '.join(result['course']['blooms_levels'])}")
        else:
            log_error("document_pipeline_test", Exception(result.get('error_message', 'Unknown error')))
    
    if args.test_type == 'all':
        # Test course planning
        logger.info("\nTesting course planning:")
        objectives = [
            "Understand key concepts",
            "Apply methods",
            "Analyze cases"
        ]
        
        schedule_constraints = {
            "start_date": "2023-09-01",
            "end_date": "2023-12-15",
            "holidays": []
        }
        
        result = tools.generate_syllabus(objectives, 3, schedule_constraints)
        
        if result["status"] == "success":
            logger.info("✅ Course planning test passed")
            logger.info(f"  Generated syllabus with {len(result['syllabus']['modules'])} modules")
        else:
            log_error("course_planning_test", Exception(result.get('error_message', 'Unknown error')))
        
        # Test assessment generation
        logger.info("\nTesting assessment generation:")
        objectives = [
            {"text": "Understand key concepts", "bloom_level": "Understanding"},
            {"text": "Apply methods", "bloom_level": "Application"},
            {"text": "Analyze cases", "bloom_level": "Analysis"}
        ]
        
        question_counts = {"mcq": 2, "true_false": 1}
        
        result = tools.generate_quiz(objectives, question_counts, "easy")
        
        if result["status"] == "success":
            logger.info("✅ Assessment generation test passed")
            logger.info(f"  Generated quiz with {result['quiz']['metadata']['question_count']} questions")
        else:
            log_error("assessment_generation_test", Exception(result.get('error_message', 'Unknown error')))

def start_interactive_mode() -> None:
    """Start interactive mode for the system."""
    logger.info("Starting interactive mode...")
    logger.info("This would launch a chat interface where users can interact with the agents.")
    logger.info("For now, this is a placeholder - interactive mode not fully implemented yet.")
    
    # Initialize a session
    user_id = "interactive_user"
    session_id = aws.initialize_session(user_id)
    logger.info(f"Created session {session_id}")
    
    # This would normally launch a real interactive interface
    # For now, just show a simple menu
    while True:
        logger.info("\nWhat would you like to do?")
        logger.info("1. Process a document")
        logger.info("2. Plan a course")
        logger.info("3. Generate an assessment")
        logger.info("4. Exit")
        
        choice = input("Enter your choice (1-4): ")
        
        if choice == "1":
            doc_path = input("Enter document path: ")
            course_name = input("Enter course name: ")
            process_document_command(argparse.Namespace(document_path=doc_path, course_name=course_name))
        elif choice == "2":
            objectives = input("Enter objectives (comma-separated) or leave blank for defaults: ")
            duration = input("Enter duration in weeks (default: 12): ")
            
            try:
                duration = int(duration) if duration else 12
            except ValueError:
                duration = 12
                
            plan_course_command(argparse.Namespace(objectives=objectives, duration=duration))
        elif choice == "3":
            course_id = input("Enter course ID (optional): ")
            assessment_type = input("Enter assessment type (quiz, exam, project) default=quiz: ")
            
            if not assessment_type:
                assessment_type = "quiz"
                
            generate_assessment_command(argparse.Namespace(
                course_id=course_id if course_id else None,
                type=assessment_type
            ))
        elif choice == "4":
            logger.info("Exiting interactive mode")
            break
        else:
            logger.info("Invalid choice, please try again")

def start_enhanced_api_server(args: argparse.Namespace) -> None:
    """Start the enhanced API server."""
    if not ENHANCED_API_AVAILABLE:
        logger.error("Enhanced API not available. Please install FastAPI and uvicorn:")
        logger.error("pip install fastapi uvicorn")
        sys.exit(1)
    
    logger.info("Starting Enhanced Pedagogical Agent API Server...")
    logger.info(f"Host: {args.host}")
    logger.info(f"Port: {args.port}")
    logger.info(f"Reload: {args.reload}")
    logger.info(f"Log Level: {args.log_level}")
    
    try:
        import uvicorn
        uvicorn.run(
            "enhanced_api:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level=args.log_level
        )
    except ImportError:
        logger.error("uvicorn not available. Please install uvicorn:")
        logger.error("pip install uvicorn")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to start API server: {e}")
        sys.exit(1)

def main() -> None:
    """Main entry point for the application."""
    parser = setup_argparse()
    args = parser.parse_args()
    
    # Create the tests directory if it doesn't exist
    os.makedirs("tests", exist_ok=True)
    
    if args.command == 'document':
        process_document_command(args)
    elif args.command == 'plan':
        plan_course_command(args)
    elif args.command == 'assessment':
        generate_assessment_command(args)
    elif args.command == 'test':
        run_tests(args)
    elif args.command == 'interactive':
        start_interactive_mode()
    elif args.command == 'api':
        start_enhanced_api_server(args)
    else:
        # No command specified, show help
        parser.print_help()
        
if __name__ == "__main__":
    main() 