# Codebase Information Document

## 1. Overview

*   **Project Goal**: To build an AI-powered system for teachers to generate educational materials (exercises, quizzes, exams, course outlines) with a focus on pedagogical soundness and alignment.
*   **Core Components**: The system consists of a Python AI agent system (`agents/`) and a React user interface (`src/`).
*   **Intended Architecture**: The UI will interact with the agent system via a backend API layer (currently not present in the provided codebase structure).
*   **Key Principles**: Leverages Google ADK concepts for modularity, context management, and orchestration; emphasizes pedagogical principles like Constructive Alignment and Bloom's Taxonomy. **Development is guided by specific rules regarding process, ADK documentation, and pedagogical alignment.**

## 2. AI Agent System (`agents/`)

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
*   **Dependencies**: Primarily `google-adk` as listed in `requirements.txt`.
*   **Deployment**: Planned deployment via Vertex AI Agent Engine, with different configurations for local dev, Cloud Run, and production.
    *   **Validation**: Includes plans for unit tests, integration tests, user acceptance testing, and monitoring.

## 3. User Interface (`src/`)

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

## 4. Relationship and Interaction

*   **Planned Interaction**: The UI will communicate with a backend API, which will then interact with the Python agent system.
*   **Data Flow Considerations**: The interaction will involve transmitting data related to course context (summarized info, objectives), task parameters (type of output, scope, Bloom's level), user interaction state, and the generated content. The backend API will need to translate UI requests into agent calls and agent responses into UI-friendly formats.
*   **Current State**: The backend API layer is not present. The agent system currently operates via a CLI, and the UI appears to have placeholder pages for functionalities like "Generate" and "Correct" that would eventually interface with the agents.

## 5. Future Work: Building the Bridge, Simplifying, and Clarifying

*   **Minimum Demonstrable Product (MDP) for Quiz Generation Completed**: As a first step, a basic backend API has been developed and integrated with the UI to demonstrate the `generate_quiz` agent tool. This serves as a foundation for further integration.
The next phase of development will focus on integrating the agent workflow directly into the chat interface and enabling dynamic UI updates based on agent interactions.

*   **Develop the Backend API**: This is the critical step to enable communication between the UI and agents. It needs to expose agent functionalities via well-defined endpoints.
*   **Integrate UI with Backend**: Modify the React components and pages to make asynchronous calls to the new backend API for triggering agent workflows and fetching results.
*   **Adapt Agents for API Interaction**: Refactor the Python agent code to be easily callable as functions or services by the backend API, moving away from a purely CLI-driven model.
*   **Simplify and Refactor Code**: Address complexity and redundancy in both the UI and agent code. This includes refining data models (`models.py`), streamlining agent workflows, and improving UI component structure.
*   **Clarification and Documentation**: Enhance inline comments, docstrings, and external documentation (including this information document) to clarify complex parts of the codebase, especially the agent orchestration and data handling.
*   **Standardization**: Establish clear patterns for data exchange between the UI, backend, and agents to ensure consistency and correctness.

## 6. Development Guidelines and Principles

This section outlines the key rules and principles that should guide development when working on this codebase, particularly for agents.

*   **Structured Development Process**: Follow the step-by-step tasks outlined in `tasks.txt`, using `agents.txt` and `prd.txt` for context and requirements. Always update `tasks.txt` upon task completion. Do not skip or reorder tasks unless explicitly instructed.
*   **Google ADK Documentation**: Whenever referencing documentation for Google's Agent Development Kit, use the official resources:
    *   [ADK API Reference](https://google.github.io/adk-docs/api-reference/index.html)
    *   [ADK Main Documentation](https://google.github.io/adk-docs)
*   **Pedagogical Alignment**: All agent logic, workflow, and recommendations *must* be informed by the pedagogical best practices, strategies, and evaluation methods described at [HEC Montréal's pedagogical resource](https://enseigner.hec.ca/pedagogie). Consult this resource for guidance on course planning, pedagogical strategies, assessment methods, engagement techniques, and accessibility considerations. Ensure all generated content and workflows are pedagogically sound and contextually relevant.
*   **Alignment with Project Vision**: Always ensure that the implementation aligns with the requirements and principles described in `project.txt` and `prd.txt`.

---

### Intended Architecture Diagram

```mermaid
graph LR
    A[User Interface (React)] --> B(Backend API)
    B --> C[AI Agent System (Python)]
    C --> D[Session Service]
    C --> E[Memory Service]
    C --> F[External Tools]
    D -- State --> B
    E -- Knowledge --> C
```

---