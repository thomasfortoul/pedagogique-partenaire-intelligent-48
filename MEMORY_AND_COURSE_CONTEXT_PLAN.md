# Plan: Simple Course Context for Agent Prompts

This document outlines a simplified approach to provide course context to agents by pulling course information from the database when a chat is opened and adding it directly to the agent prompt.

## Overview

When a user opens a chat for a specific course, we will:
1. Fetch the complete course information from the database
2. Format this information into a clear context string
3. Add this context to the agent's system prompt

## Implementation

### 1. Database Query on Chat Open

When a chat session is initiated for a course:
- Query the database for the complete course record using the course ID
- Retrieve all relevant course fields: title, description, level, instructor, session details, documents, etc.

### 2. Format Course Context

Create a simple, readable context string from the course data:

```
=== COURSE CONTEXT ===
Course: [title]
Level: [level]
Instructor: [instructor]
Description: [description]
Session: [session]
Documents: [list of document titles]
=== END COURSE CONTEXT ===
```

### 3. Inject into Agent Prompt

Add the formatted course context to the beginning of the agent's system prompt:

```
[COURSE_CONTEXT_STRING]

You are a pedagogical AI assistant for this course. Use the course context above to provide relevant, course-specific assistance to students.

[REST_OF_AGENT_INSTRUCTIONS]
```

### 4. Implementation Points

- Modify the agent initialization to accept course context
- Update the chat handler to fetch course data when starting a new chat
- Ensure course context is available to all relevant agents (learning objectives, syllabus planner, assessment generator, etc.)

## Benefits

- Simple and straightforward implementation
- No complex memory management required
- Course context is always fresh and accurate
- Easy to debug and maintain
- Consistent course information across all agent interactions

## Files to Modify

- `agents/multi_tool_agent/agentic_workflow_system.py` - Add course data fetching
- `agents/multi_tool_agent/agent.py` - Modify agent initialization to include course context
- Database query functions - Add course data retrieval
- `sample-platfor/lib/db/supabase-service.ts` - Implement/modify functions for fetching course data
- `database.sql` - Reference for database schema
- `project.txt` scope of project