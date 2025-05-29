"""
Logging configuration for the multi_tool_agent.
Provides standardized logging for API calls and responses.
"""

import logging
import json
import sys
import os
from datetime import datetime
from typing import Any, Dict, Optional

# Get the absolute path of the script's directory
# Use __file__ to correctly get the path of the current script
script_dir = os.path.abspath(os.path.dirname(__file__))

# Create logs directory relative to the agents directory
# Assumes logger.py is in agents/multi_tool_agent/logger.py
# script_dir is agents/multi_tool_agent
# os.path.dirname(script_dir) is agents
# logs_dir is agents/logs
logs_dir = os.path.join(os.path.dirname(os.path.dirname(script_dir)), "logs") # Corrected path to be ../logs relative to multi_tool_agent
os.makedirs(logs_dir, exist_ok=True)


# Configure multi_tool_agent logger
logger = logging.getLogger("multi_tool_agent")
logger.setLevel(logging.DEBUG)  # Capture all messages from DEBUG up for this logger
logger.propagate = False # Prevent messages from being passed to parent (root) logger

# Clear existing handlers to prevent duplicate output if module is reloaded
if logger.handlers:
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        handler.close() # Close handler when removing

# Console handler for multi_tool_agent logger
console_handler = logging.StreamHandler(sys.stdout)
console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(console_format)
console_handler.setLevel(logging.INFO) # Console shows INFO and above for multi_tool_agent
logger.addHandler(console_handler)

# File handler
try:
    log_filename = f"multi_tool_agent_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    file_path = os.path.join(logs_dir, log_filename)
    
    # This file_handler will be used by multi_tool_agent logger AND the root logger
    file_handler = logging.FileHandler(
        file_path,
        encoding='utf-8',
        delay=False 
    )
    file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_format)
    file_handler.setLevel(logging.DEBUG)  # File logs DEBUG and above for all sources
    
    # Add file_handler to multi_tool_agent logger
    logger.addHandler(file_handler)

    # Configure root logger to also use this file_handler
    # This will capture logs from other modules (e.g., google_llm, fast_api)
    # that propagate to the root logger.
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG) # Ensure root logger processes DEBUG messages for its handlers

    # Add file_handler to root logger only if a similar handler isn't already present
    is_handler_present = any(
        isinstance(h, logging.FileHandler) and getattr(h, 'baseFilename', None) == file_handler.baseFilename
        for h in root_logger.handlers
    )
    if not is_handler_present:
        root_logger.addHandler(file_handler)
    
    print(f"Logging to file: {file_path}") # This print is for immediate feedback
    logger.debug("File logging initialized for multi_tool_agent logger. Root logger also configured to use this file handler.")

except Exception as e:
    # Use root logger for this error as our logger might be the one failing
    logging.getLogger().error(f"Error setting up file handler: {e}", exc_info=True)
    # Also print to console as a fallback
    print(f"CRITICAL: Error setting up file handler: {e}")


def format_json(obj: Any) -> str:
    """Format an object as a pretty-printed JSON string."""
    try:
        return json.dumps(obj, indent=2, ensure_ascii=False)
    except TypeError: # Catch specific error for non-serializable objects
        return str(obj)

def log_api_request(endpoint: str, request_data: Dict[str, Any], session_id: Optional[str] = None) -> None:
    """Log an API request with formatted data."""
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.info(f"API REQUEST{session_info} - {endpoint}")
    logger.info(f"REQUEST DATA:\n{format_json(request_data)}")

def log_api_response(endpoint: str, response_data: Dict[str, Any], session_id: Optional[str] = None) -> None:
    """Log an API response with formatted data."""
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.info(f"API RESPONSE{session_info} - {endpoint}")
    logger.info(f"RESPONSE DATA:\n{format_json(response_data)}")

def log_agent_call(agent_name: str, input_data: Dict[str, Any], session_id: Optional[str] = None) -> None:
    """Log an agent call with formatted input data."""
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.info(f"AGENT CALL{session_info} - {agent_name}")
    logger.info(f"INPUT DATA:\n{format_json(input_data)}")

def log_agent_response(agent_name: str, output_data: Dict[str, Any], session_id: Optional[str] = None) -> None:
    """Log an agent response with formatted output data."""
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.info(f"AGENT RESPONSE{session_info} - {agent_name}")
    logger.info(f"OUTPUT DATA:\n{format_json(output_data)}")

def log_tool_call(tool_name: str, input_data: Dict[str, Any], session_id: Optional[str] = None) -> None:
    """Log a tool call with formatted input data."""
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.info(f"TOOL CALL{session_info} - {tool_name}")
    logger.info(f"INPUT DATA:\n{format_json(input_data)}")

def log_tool_response(tool_name: str, output_data: Dict[str, Any], session_id: Optional[str] = None) -> None:
    """Log a tool response with formatted output data."""
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.info(f"TOOL RESPONSE{session_info} - {tool_name}")
    logger.info(f"OUTPUT DATA:\n{format_json(output_data)}")

def log_chat_message(message: str, session_id: Optional[str] = None, is_user: bool = True) -> None:
    """Log a chat message."""
    sender_type = "USER" if is_user else "AGENT"
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.info(f"CHAT MESSAGE ({sender_type}){session_info}:\n{str(message)}")

def log_error(context: str, error: Exception, session_id: Optional[str] = None) -> None:
    """Log an error with context."""
    session_info = f" [Session: {session_id}]" if session_id else ""
    logger.error(f"ERROR{session_info} - {context}: {str(error)}", exc_info=True)