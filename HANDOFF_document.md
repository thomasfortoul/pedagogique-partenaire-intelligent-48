# Comprehensive Handoff Documentation for ERGI

This document provides a comprehensive overview of the ERGI project, an AI-powered pedagogical co-pilot, intended for technical personnel. It covers the application's purpose, architecture, key features, technical details, and future development considerations.

## 1. Application Overview

*   **Core Purpose:** ERGI is an AI-powered system designed to assist educators in creating high-quality educational materials (exercises, quizzes, exams, course outlines) with a focus on pedagogical soundness and alignment. It aims to streamline the process of defining learning objectives, designing teaching strategies, and generating assessments, ultimately saving educators time and improving the quality of educational content.
*   **High-Level Technical Architecture:** The application is a full-stack solution comprising a React/Vite frontend, a Python/FastAPI backend that hosts the agentic system, and a Supabase instance for data persistence and user authentication. The frontend is a single-page application that communicates with the backend via a REST API. The backend orchestrates a multi-agent system built with the Google Agent Development Kit (ADK) to handle complex pedagogical tasks.

## 2. Technical Architecture

*   **Frameworks and Libraries:**
    *   **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query.
    *   **Backend:** Python, FastAPI, Google Agent Development Kit (ADK).
    *   **Database:** Supabase (PostgreSQL).

*   **Project Structure:**
    *   [`src/`](src/): Contains the main React application, including pages, components, and hooks.
    *   [`agents/multi_tool_agent/`](agents/multi_tool_agent/): The core of the AI system, built with Python and the Google ADK. It defines the agents, their tools, and the overall workflow.
    *   [`database.sql`](database.sql): Defines the database schema.

*   **High-Level Architecture Diagram:**
    ```mermaid
    graph TD
        A[User Browser] --> B{React/Vite Frontend};
        B --> C{FastAPI Backend};
        C --> D[Google ADK Agentic System];
        D --> E[LLM];
        C --> F[Supabase];
        B --> F;
    ```

## 3. Key Features and Functionality

*   **User Authentication:** Users can sign up, log in, and manage their accounts via Supabase. The flow is handled by the [`src/lib/auth/`](src/lib/auth/) directory.
*   **Course Management:** Users can create, view, and manage courses. Each course can have associated documents and pedagogical information. This is managed through the [`src/pages/Dashboard2.tsx`](src/pages/Dashboard2.tsx) and [`src/pages/CourseDashboard.tsx`](src/pages/CourseDashboard.tsx) pages.
*   **Agentic Interaction:** The core feature is the chat-based interface where users interact with the AI agentic system to generate educational content. This is handled by the [`src/pages/Generate.tsx`](src/pages/Generate.tsx) page.
*   **Dashboard:** A comprehensive dashboard provides an overview of created courses, statistics, and recent activities.

## 4. Data Flow and State Management

*   **State Variables:**
    *   **Frontend:** Component state is managed with [`useState`](https://react.dev/reference/react/useState) and [`useEffect`](https://react.dev/reference/react/useEffect). Server state (data from Supabase and the agentic backend) is managed with `@tanstack/react-query`.
    *   **Backend:** Session state for the agentic workflow is managed in memory.
*   **Data Processing:**
    1.  The user interacts with the React frontend.
    2.  For data-related actions (e.g., fetching courses), the frontend calls Supabase directly.
    3.  For agentic interactions, the frontend sends a request to the FastAPI backend.
    4.  The FastAPI backend orchestrates the agentic workflow using the Google ADK, which may involve calling an LLM.
    5.  The response from the agentic system is sent back to the frontend and displayed to the user.
*   **Data Flow Diagram:**
    ```mermaid
    sequenceDiagram
        participant User
        participant Frontend
        participant FastAPI_Backend as FastAPI Backend
        participant Agentic_System as Agentic System
        participant Supabase
        User->>Frontend: Interact with UI
        Frontend->>Supabase: Fetch/Update data (e.g., courses)
        Supabase-->>Frontend: Return data
        User->>Frontend: Send message to agent
        Frontend->>FastAPI_Backend: /run request
        FastAPI_Backend->>Agentic_System: Process message
        Agentic_System-->>FastAPI_Backend: Return response
        FastAPI_Backend-->>Frontend: Send response
        Frontend-->>User: Display response
    ```

## 5. AI Integration

*   **AI Processing Flow:** The AI is a multi-agent system orchestrated by the Google ADK. Different agents are responsible for specific tasks like defining learning objectives, planning course structure, and generating assessments.
*   **Prompt Engineering:** The core prompt is defined in [`agents/multi_tool_agent/prompt.txt`](agents/multi_tool_agent/prompt.txt). It sets the role, objectives, and pedagogical principles for the AI. Each agent also has its own specific instructions.
*   **Agentic Workflow Diagram:**
    ```mermaid
    graph LR
        A[User Request] --> B(Root Orchestrator);
        B --> C{Learning Objective Agent};
        B --> D{Syllabus Planner Agent};
        B --> E{Assessment Generator Agent};
        C --> F[Tool: extract_learning_objectives];
        D --> G[Tool: plan_course_structure];
        E --> H[Tool: generate_assessment_item];
    ```

## 6. Key Components

*   [`src/pages/Generate.tsx`](src/pages/Generate.tsx): The main interface for interacting with the agentic system. It manages the chat history, user input, and displays the agent's responses.
*   [`src/pages/Dashboard2.tsx`](src/pages/Dashboard2.tsx): The main dashboard for users to view and manage their courses.
*   [`src/pages/CourseDashboard.tsx`](src/pages/CourseDashboard.tsx): A detailed view for a single course, showing statistics and related information.
*   [`agents/multi_tool_agent/agentic_workflow_system.py`](agents/multi_tool_agent/agentic_workflow_system.py): The central orchestration logic for the agentic system. It manages session state and coordinates the different agents.
*   [`agents/multi_tool_agent/agent.py`](agents/multi_tool_agent/agent.py): Defines the individual agents and their tools.
*   [`src/components/`](src/components/): Reusable UI components (including shadcn/ui).
*   [`src/pages/`](src/pages/): Top-level page components (Dashboard, Generate, Correct, Login, etc.).
*   [`src/hooks/`](src/hooks/): Custom React hooks.
*   [`src/lib/`](src/lib/): Utility functions.
*   [`src/App.tsx`](src/App.tsx): Main application component, routing, and context providers.
*   [`src/main.tsx`](src/main.tsx): React application entry point.
*   [`agents/parent_folder/multi_tool_agent/main.py`](agents/parent_folder/multi_tool_agent/main.py): CLI entry point for the agent system.
*   [`agents/parent_folder/multi_tool_agent/document_pipeline.py`](agents/parent_folder/multi_tool_agent/document_pipeline.py): Document processing pipeline.
*   [`agents/parent_folder/multi_tool_agent/models.py`](agents/parent_folder/multi_tool_agent/models.py): Core data models (Course, Task/Document, User Interaction State).
*   [`agents/parent_folder/multi_tool_agent/tools.py`](agents/parent_folder/multi_tool_agent/tools.py): Custom tools used by agents.

## 7. Extension Points

*   **Adding New Features:** New pages and components can be added to the [`src/`](src/) directory. New routes can be added in [`src/App.tsx`](src/App.tsx).
*   **Enhancing AI Models:** New agents can be defined in [`agents/multi_tool_agent/agent.py`](agents/multi_tool_agent/agent.py) and integrated into the workflow in [`agents/multi_tool_agent/agentic_workflow_system.py`](agents/multi_tool_agent/agentic_workflow_system.py). New tools can be added in [`agents/multi_tool_agent/tools.py`](agents/multi_tool_agent/tools.py).

## 8. UI/UX Design Principles

*   **Design System:** The UI is built with `shadcn/ui`, a collection of reusable UI components. This ensures a consistent look and feel across the application.
*   **Responsive Design:** The application is designed to be responsive and work on different screen sizes, using Tailwind CSS for utility-first styling.

## 9. API Routes

*   **`/run` (POST):** The main endpoint for interacting with the agentic system. It takes a user message and session information and returns the agent's response.
*   **Supabase API:** The frontend interacts directly with the Supabase API for database operations.
*   **Planned Interaction:** The UI communicates directly with the AI Agent System's API endpoints.

## 10. State Management Patterns

*   **Component State:** Local component state is managed using React's [`useState`](https://react.dev/reference/react/useState) and [`useEffect`](https://react.dev/reference/react/useEffect) hooks.
*   **Server State:** `@tanstack/react-query` is used to manage server state, including caching, refetching, and optimistic updates.
*   **Authentication State:** `useAuth` context provides authentication state throughout the application.

## 11. Progressive Enhancement

*   **Loading States:** The application displays loading indicators while fetching data or waiting for agent responses.
*   **Fallback Content:** If data is not available, the application displays appropriate fallback content (e.g., "No courses found").

## 12. Known Limitations and Considerations

*   **Hardcoded Data:** The agentic system currently relies on hardcoded sample data for courses and assessments. This needs to be replaced with data from Supabase.
*   **Context Management:** The context and memory management for the agentic system needs to be improved to provide more personalized and context-aware responses.
*   **Current State of Integration:** What works right now is just the UI connecting with the backend for a simple agentic interaction for a hardcoded biology course. However, creating courses does integrate with user auth and work with supabase, the information from said course (in the dashboard page does not get transmitted correctly to the agent for context). The key improvement to be done is fixing the context and memory management for the agentic system.

## 13. Deployment and Environment

*   **Environment Variables:** The application uses a `.env` file for environment variables, which should be configured for different environments (development, staging, production).
*   **Deployment Considerations:** The React frontend can be deployed as a static site. The FastAPI backend needs to be hosted on a server that can run Python applications.
*   **AI Agent System Deployment:** Planned deployment via Vertex AI Agent Engine, with different configurations for local dev, Cloud Run, and production.

## 14. Future Development Roadmap

*   **Integrate Supabase with Agentic System:** Replace the hardcoded data in the agentic system with real data from Supabase.
*   **Improve Context and Memory Management:** Implement a more robust system for managing context and memory in the agentic workflow to provide better long-term memory and personalization.
*   **Add More Tools:** Extend the agentic system with more tools to cover a wider range of pedagogical tasks.
*   **Building the Bridge, Simplifying, and Clarifying:**
    *   Minimum Demonstrable Product (MDP) for Quiz Generation Completed: A basic integration exists where the UI sends messages to the `multi_tool_agent` via its ADK API `/run` endpoint. The next phase of development will focus on fully integrating the agent workflow into the chat interface and enabling dynamic UI updates based on structured agent responses.
    *   Enhance Agent Responses for UI Updates: Modify the Python agent system to return structured data (e.g., JSON objects for `taskParameters` and `generatedExam`) in addition to text responses, enabling dynamic updates in the UI.
    *   Integrate UI with Structured Agent Responses: Modify the React components to parse and utilize structured data received from agent responses to dynamically update UI elements and display generated content.
    *   Simplify and Refactor Code: Address complexity and redundancy in both the UI and agent code. This includes refining data models (`models.py`), streamlining agent workflows, and improving UI component structure.
    *   Clarification and Documentation: Enhance inline comments, docstrings, and external documentation (including this information document) to clarify complex parts of the codebase, especially the agent orchestration and data handling.
    *   Standardization: Establish clear patterns for data exchange between the UI, backend, and agents to ensure consistency and correctness.

## 15. Testing Strategy

*   **Current Approach:** The current testing strategy is not explicitly defined in the codebase. There are some simple test files in [`agents/multi_tool_agent/`](agents/multi_tool_agent/) but no comprehensive testing framework is in place.
*   **Recommendations:** Implement a testing strategy that includes unit tests for individual components and functions, integration tests for the frontend and backend, and end-to-end tests for the complete user workflow.
*   **AI Agent System Validation:** Includes plans for unit tests, integration tests, user acceptance testing, and monitoring.

## 16. Database Schema

*   **ERD Diagram:**
    ```mermaid
    erDiagram
        users ||--o{ courses : "has"
        users ||--o{ chat_sessions : "has"
        users ||--o{ generated_artifacts : "has"
        courses ||--o{ chat_sessions : "has"
        courses ||--o{ generated_artifacts : "has"
        predefined_tasks ||--o{ chat_sessions : "has"

        users {
            uuid id PK
            text name
            text role
            timestamp created_at
        }
        courses {
            uuid id PK
            uuid user_id FK
            text title
            text description
            text level
            jsonb summarized_pedagogical_info
            timestamp created_at
            timestamp updated_at
        }
        chat_sessions {
            uuid id PK
            uuid user_id FK
            uuid course_id FK
            uuid current_task_id FK
            jsonb context_summary
            timestamp created_at
            timestamp last_interaction_at
        }
        generated_artifacts {
            uuid id PK
            uuid course_id FK
            uuid user_id FK
            text type
            timestamp creation_date
            jsonb content
            text export_format
            jsonb version_history
        }
        predefined_tasks {
            uuid id PK
            text category
            text name
            text description
            jsonb required_info_schema
        }
    ```

## 17. AI Agent System Details

*   **Purpose**: Automated generation and processing of educational content.
*   **Core Functionality**: Document summarization and extraction, learning objective drafting and refinement, syllabus planning, assessment generation, resource recommendations.
*   **Key Files/Modules**:
    *   [`main.py`](agents/parent_folder/multi_tool_agent/main.py): CLI entry point.
    *   [`agentic_workflow_system.py`](agents/parent_folder/multi_tool_agent/agentic_workflow_system.py): Agent implementations and orchestration logic.
    *   [`document_pipeline.py`](agents/parent_folder/multi_tool_agent/document_pipeline.py): Document processing pipeline.
    *   [`models.py`](agents/parent_folder/multi_tool_agent/models.py): Core data models (Course, Task/Document, User Interaction State).
    *   [`tools.py`](agents/parent_folder/multi_tool_agent/tools.py): Custom tools used by agents.
*   **Architecture**:
    *   **Agent Types**: `LlmAgent` (LearningObjectiveAgent, SyllabusPlannerAgent, AssessmentGeneratorAgent), `SequentialAgent` (CoursePrepWorkflowAgent), `LoopAgent` (ObjectiveRefinementAgent), Dynamic Routing (`ContentRoutingAgent`).
    *   **Orchestration Patterns**: Phase-level sequencing, module-level parallelization, Agent-to-Agent (A2A) protocol (`ProposalMessage`, `ApprovalMessage`, `RevisionRequest`), dynamic LLM routing.
*   **Session Management**: Uses `SessionService` (`InMemorySessionService` for dev, `VertexAiSessionService` for prod) to manage session states (`ObjectivesCaptured`, `StructureProposed`, `DraftReady`, etc.) and transitions.
*   **Long-Term Memory**: Uses `MemoryService` (`InMemoryMemoryService` for dev, `VertexAiRagMemoryService` for prod) to store and retrieve knowledge like alignment rules, Bloom mappings, and prior assessments.
*   **Tool Integration**: Utilizes Custom Tools (SyllabusGeneratorTool, BloomAlignmentChecker, ResourceRecommenderTool, QuizGeneratorTool, etc.), ADK Built-in Tools (`search_tool`, `code_execution_tool`), and planned External Tools (LMS API, Google Drive/Docs API).
*   **Error Handling & Guardrails**: Includes mechanisms like `BloomAlignmentGuardrail`, timeouts, retries, and constraint callbacks.
*   **Dependencies**: Primarily `google-adk` as listed in [`agents/requirements.txt`](agents/requirements.txt).
*   **Deployment**: Planned deployment via Vertex AI Agent Engine, with different configurations for local dev, Cloud Run, and production.
*   **Validation**: Includes plans for unit tests, integration tests, user acceptance testing, and monitoring.

## 18. User Interface Details

*   **Purpose**: Provide a web-based interface for users to interact with the system (currently seems focused on course management, document uploads, and potentially triggering generation/correction tasks).
*   **Core Functionality**: User authentication, course management (displaying courses, viewing details), document uploading, navigation to different features (generate, correct, dashboards).
*   **Key Directories**:
    *   [`src/components/`](src/components/): Reusable UI components (including shadcn/ui).
    *   [`src/pages/`](src/pages/): Top-level page components (Dashboard, Generate, Correct, Login, etc.).
    *   [`src/hooks/`](src/hooks/): Custom React hooks.
    *   [`src/lib/`](src/lib/): Utility functions.
*   **Main Entry Points**:
    *   [`src/App.tsx`](src/App.tsx): Main application component, routing, and context providers.
    *   [`src/main.tsx`](src/main.tsx): React application entry point.
*   **Technologies**: React, react-router-dom, @tanstack/react-query, TypeScript, Tailwind CSS, shadcn/ui.
*   **Authentication**: Simple session management using localStorage.
*   **Routing**: Defined in [`src/App.tsx`](src/App.tsx) using react-router-dom.

## 19. Relationship and Interaction

*   **Planned Interaction**: The UI communicates directly with the AI Agent System's API endpoints.
*   **Data Flow Considerations**: The interaction involves transmitting data related to user input (chat messages), session context, and task parameters. The agent system is expected to return not only text responses but also structured data (e.g., for UI field updates, generated artifacts).
*   **Current State of Integration**: The [`src/pages/Generate.tsx`](src/pages/Generate.tsx) component successfully sends user messages to the `multi_tool_agent` via its `/run` API endpoint. However, the UI is currently only processing the text content of agent responses, and the logic for dynamically updating UI fields (like task parameters or displaying the generated exam) based on structured data from agent responses is commented out or not yet fully implemented. The agent system needs to be enhanced to consistently return structured data for UI consumption.

## 20. Development Guidelines and Principles

This section outlines the key rules and principles that should guide development when working on this codebase, particularly for agents.

*   **Structured Development Process**: Follow the step-by-step tasks outlined in [`agents/tasks.txt`](agents/tasks.txt), using [`agents/agents.txt`](agents/agents.txt) and [`agents/prd.txt`](agents/prd.txt) for context and requirements. Always update [`agents/tasks.txt`](agents/tasks.txt) upon task completion. Do not skip or reorder tasks unless explicitly instructed.
*   **Google ADK Documentation**: Whenever referencing documentation for Google's Agent Development Kit, use the official resources:
    *   [ADK API Reference](https://google.github.io/adk-docs/api-reference/index.html)
    *   [ADK Main Documentation](https://google.github.io/adk-docs)
*   **Pedagogical Alignment**: All agent logic, workflow, and recommendations *must* be informed by the pedagogical best practices, strategies, and evaluation methods described at [HEC Montréal's pedagogical resource](https://enseigner.hec.ca/pedagogie). Consult this resource for guidance on course planning, pedagogical strategies, assessment methods, engagement techniques, and accessibility considerations. Ensure all generated content and workflows are pedagogically sound and contextually relevant.
*   **Alignment with Project Vision**: Always ensure that the implementation aligns with the requirements and principles described in [`agents/project.txt`](agents/project.txt) and [`agents/prd.txt`](agents/prd.txt).