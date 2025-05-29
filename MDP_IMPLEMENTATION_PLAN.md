# Development Plan: Chat Integration and Dynamic UI

This document outlines the prioritized tasks and implementation steps for integrating the agent workflow into the chat interface and enabling dynamic UI updates based on agent interactions.

## Prioritized Development Tasks

**High Priority (Focus on Chat Integration and Dynamic UI):**

- [x] Basic Backend API for ADK `run` endpoint (Completed for MDP, serves as the chat endpoint)
- [x] Basic UI Interaction for MDP Workflow (Completed for MDP, now needs to be fully integrated with chat)
- [x] Basic Data Passing (UI -> Agent) (Completed for MDP, needs adaptation for full chat context)
- [x] Basic Data Passing (Agent -> UI) (Completed for MDP, needs adaptation for structured responses and UI updates)
- [x] Basic UI Reflects Agent Identity/Status (Completed for MDP, needs enhancement for chat flow)
- [x] Basic Logging (Completed for MDP, needs to cover chat interactions)
- [ ] **Enhance Agent Responses for UI Updates**: Modify the `multi_tool_agent` to return structured data (e.g., JSON objects for `taskParameters` and `generatedExam`) in addition to text responses, enabling dynamic updates in the UI. This involves defining clear output schemas for agent responses.
- [ ] **Integrate Chat UI with Structured Agent Responses**: Modify `src/pages/Generate.tsx` to parse and utilize structured data received from agent responses to dynamically update UI elements (like `taskParameters` and `generatedExam`) and display generated content. This will involve uncommenting and adapting the existing UI update logic.
- [ ] **Implement Agent Orchestration for Chat Flow**: Refine the `multi_tool_agent`'s internal logic to manage the conversation flow, determine the appropriate agent or workflow step based on user input and current state, execute it, and formulate a comprehensive response for the UI (text + structured data). This includes handling the transition from information gathering to quiz generation.
- [ ] **Refine UI to Reflect Agent Progress**: Enhance the UI to visually indicate the current agent involved in the conversation and the overall progress of the task, potentially by updating the `currentAgent` state based on agent responses.

**Medium Priority (Refinement and Usability):**

- [x] Basic Error Handling (Completed for MDP, needs expansion for chat)
- [x] Refine Data Models for MDP (Completed for MDP, needs refinement for chat context and dynamic UI data)
- [ ] Enhance UI to reflect agent identity and progress within the chat flow.
- [ ] Implement more robust error handling and feedback for chat interactions.

**Lower Priority (Defer for later phases):**

- [ ] Full Database Integration
- [ ] Comprehensive Agent Orchestration (beyond the chat flow)
- [ ] Advanced UI Features (dynamic output quality indicator, persistent sidebar - beyond basic parameter display)
- [ ] Full Authentication System
- [ ] Extensive Error Reporting/Monitoring
- [ ] Implement other agent workflows (document processing, syllabus planning) via the chat interface.

## Implementation Steps for High-Priority Tasks (Chat Integration)

This plan focuses on building the interactive chat experience:

1.  **Agent System Enhancement (`agents/multi_tool_agent/`)**:
    *   **Define Structured Output for Agents**: Update agent definitions and their `invoke` methods to return a structured object that includes both the conversational text response and any relevant UI update data (e.g., `taskParameters`, `generatedExam`). This might involve defining new Pydantic models for agent outputs.
    *   **Implement UI Update Logic within Agents**: Agents should be responsible for determining when and what `taskParameters` or `generatedExam` data to send back to the UI. For example, after the "Agent Objectifs" defines objectives, it should include the `learningObjectives` in its structured response. When the "Agent Créateur d'Examen" finishes, it should include the `generatedExam` data.
    *   **Refine Agent Orchestration (`agentic_workflow_system.py`)**: Ensure the `multi_tool_agent` correctly processes the structured outputs from sub-agents and aggregates them into a single structured response to be sent back to the UI via the `/run` endpoint. This includes managing the `step` or `current_agent_id` to reflect progress.

2.  **Frontend Integration (`src/pages/Generate.tsx`)**:
    *   **Parse Structured Agent Responses**: In `handleSendMessage`, modify the logic to parse the `resultEvents` from the ADK API. Instead of just concatenating `part.text`, look for specific `functionResponse` or other structured parts that contain UI update data.
    *   **Uncomment and Adapt UI Update Logic**: Re-enable and adapt the commented-out `if (result.ui_updates)` block (lines 283-298) to correctly process the structured data received from the agent. This will involve mapping the incoming structured data to the `setTaskParameters`, `setGeneratedExam`, `setShowExam`, and `setStep` states.
    *   **Dynamic Thinking Bubble/Agent Display**: Ensure the `thinkingStep` and `currentAgent` states are updated based on the `current_agent_id` received in the structured agent response, providing real-time feedback on which agent is active.
    *   **Trigger Quiz Generation**: The `handleSendMessage` function will implicitly trigger the quiz generation when the agent workflow reaches that stage and returns the `generatedExam` data. No separate `handleGenerateMdpQuiz` function is needed if the entire process is driven by the chat.

3.  **Refinement and Testing**:
    *   **Error Handling**: Enhance error handling in both frontend and backend to gracefully manage unexpected agent responses or communication issues.
    *   **Testing**: Thoroughly test the end-to-end flow, ensuring that user inputs correctly drive the agent workflow, UI fields update dynamically, and the final exam is generated and displayed as expected.