# Plan: Enhance Agent Context with Memory and Course Details

This document outlines the plan to refactor how memory-based information and course details are provided to agents, moving from a session state to a single, large direct prompt. This prompt will include parsed `course_details_json` (a JSON object) and other course attributes formatted as `Column_Name: Value`. The memory-based information will specifically include the most recent user query and the agent's last response.

## Phase 1: Information Gathering and Context Understanding (Completed)

*   **Examined Agent System Files:** Reviewed the directory structure of `agents/multi_tool_agent`.
*   **Reviewed Session State/Memory Implementation:** Investigated `agents/multi_tool_agent/agentic_workflow_system.py` to understand how session state and context are managed, and how the most recent user query and agent's last response are stored.
*   **Reviewed Course Data Structure:** Examined `agents/multi_tool_agent/models.py` for Python data structures and `src/types/course.ts` for TypeScript course interface.
*   **Reviewed Prompt Construction Logic:** Analyzed `agents/multi_tool_agent/agent.py` for agent definitions and how prompts are currently constructed.

## Phase 2: Detailed Plan for Implementation

### 1. Update Course Data Models

*   **Modify `agents/multi_tool_agent/models.py`:**
    *   Add a new field `course_details_json: Optional[Dict[str, Any]] = None` to the `Course` dataclass. This field will store the JSON object containing detailed course information.

    ```python
    # agents/multi_tool_agent/models.py
    @dataclass
    class Course:
        id: str
        title: str
        description: str
        level: Optional[str] = None
        documents: Optional[List[Dict]] = field(default_factory=list)
        course_details_json: Optional[Dict[str, Any]] = None # New field
    ```

*   **Modify `src/types/course.ts` (if necessary):**
    *   Add `courseDetailsJson?: Record<string, any>;` to the `Course` interface to maintain consistency across the frontend and backend models. This will be confirmed during the implementation phase.

    ```typescript
    // src/types/course.ts
    export interface Course {
      id: string;
      title: string;
      description?: string;
      level?: string;
      documents?: Document[];
      session?: string;
      instructor?: string;
      courseDetailsJson?: Record<string, any>; // New field
    }
    ```

### 2. Modify `get_user_context_from_session` in `agents/multi_tool_agent/agentic_workflow_system.py`

This function will be enhanced to retrieve and format all necessary context for the direct prompt.

*   **Retrieve Most Recent User Query and Agent's Last Response:**
    *   Identify the keys within `session.state["chat_context"]` that store the most recent user query and the agent's last response. Extract these values.

*   **Fetch Course Details:**
    *   The `current_course` object is already retrieved from the session. Ensure all its attributes, including the new `course_details_json`, are accessible.

*   **Parse `course_details_json`:**
    *   If `current_course.course_details_json` is a string representation of a JSON object, parse it into a Python dictionary. If it's already a dictionary, no parsing is needed. Handle potential parsing errors gracefully.

*   **Format Other Course Attributes:**
    *   Iterate through the `current_course` object's attributes (e.g., `id`, `title`, `description`, `level`, `documents`, `session`, `instructor`) and format them as `Column_Name: Value` strings. Exclude `course_details_json` from this formatting, as its content will be presented separately.

*   **Construct a Consolidated Context String:**
    *   Create a well-formatted string that combines all the extracted and processed information. The structure should be clear and easy for the agents to interpret.
    This information is taken directly from the supabase database.

    ```python
    # Example structure for the consolidated context string
    """
    --- CONTEXT ---
    Most Recent User Query: [user_query_text]
    Agent's Last Response: [agent_response_text]

    --- CURRENT COURSE DETAILS ---  
    Course_ID: [course.id]
    Course_Name: [course.title]
    Course_Level: [course.level]
    Course_Description_Summary: [course.description]
    Course_Session: [course.session]
    Course_Instructor: [course.instructor]

    --- DETAILED COURSE INFORMATION (JSON) ---
    [parsed_course_details_json_content_formatted]
    --- END CONTEXT ---
    """
    ```

### 3. Inject Consolidated Context into Agent Prompts

*   **Identify Agent Instruction Points:**
    *   Locate where the `instruction` parameter is defined for `LlmAgent` and `Agent` instances in `agents/multi_tool_agent/agent.py` and `agents/multi_tool_agent/agentic_workflow_system.py` (e.g., `learning_objective_agent`, `syllabus_planner_agent`, `assessment_generator_agent`, `pedagogical_orchestrator_enhanced`).

*   **Modify Agent Instructions:**
    *   Prepend or embed the consolidated context string (generated in step 2) into the `instruction` of relevant agents. This will provide the agents with the necessary memory and course details directly in their prompt. This might involve dynamically constructing the instruction string before passing it to the agent.

### 4. Update Agent Calls

*   **Review `handle_chat_message_enhanced` in `agents/multi_tool_agent/agentic_workflow_system.py`:**
    *   Ensure that this function, or any other part of the workflow that invokes agents, correctly retrieves the necessary components (user query, agent response, current course) to build the consolidated context string before passing it to the agent's prompt.

## Workflow Diagram

```mermaid
graph TD
    A[Start] --> B{Update Course Data Models};
    B --> B1[Modify agents/multi_tool_agent/models.py: Add course_details_json to Course dataclass];
    B --> B2[Consider src/types/course.ts for consistency];

    B2 --> C[Modify get_user_context_from_session in agentic_workflow_system.py];
    C --> C1[Extract Most Recent User Query & Agent Response];
    C --> C2[Access Current Course Object & new course_details_json];
    C --> C3[Parse course_details_json];
    C --> C4[Format Other Course Attributes: Column_Name: Value];
    C --> C5[Construct Consolidated Context String];

    C5 --> D[Inject Consolidated Context into Agent Prompts];
    D --> E[Update Agent Calls];
    E --> F[End];