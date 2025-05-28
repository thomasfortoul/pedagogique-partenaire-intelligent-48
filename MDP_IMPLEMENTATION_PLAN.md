# Development Plan: Chat Integration and Dynamic UI

This document outlines the prioritized tasks and implementation steps for integrating the agent workflow into the chat interface and enabling dynamic UI updates based on agent interactions.

## Prioritized Development Tasks

**High Priority (Focus on Chat Integration and Dynamic UI):**

- [x] Define Minimal Backend API (Completed for MDP, needs expansion for chat)
- [x] Select/Adapt a Simple Agent Workflow (Completed for MDP, will be integrated into chat flow)
- [x] Implement UI Interaction for MDP Workflow (Completed for MDP, will be replaced by chat interaction)
- [x] Handle Basic Data Passing (UI -> Backend -> Agent) (Completed for MDP, needs adaptation for chat context)
- [x] Handle Basic Data Passing (Agent -> Backend -> UI) (Completed for MDP, needs adaptation for chat responses and UI updates)
- [x] Ensure UI Reflects Agent Identity/Status (Basic) (Completed for MDP, needs enhancement for chat flow)
- [x] Establish Basic Logging (Completed for MDP, needs to cover chat endpoints)
- [ ] **Develop Backend Endpoints for Chat**: Create API endpoints to receive user chat messages, manage session context, and interact with the agent orchestration.
- [ ] **Implement Agent Orchestration for Chat**: Modify or create logic in the agent system to receive chat inputs, determine the appropriate agent or workflow step, execute it, and formulate a response for the UI, including any data for UI field updates.
- [ ] **Integrate Chat UI with Backend**: Modify `src/pages/Generate.tsx` to send user messages to the new backend chat endpoint and process the responses. Replace the hardcoded chat sequence.
- [ ] **Dynamically Update UI Fields**: Implement logic in the UI to parse agent responses and update relevant fields (like "Type de Document", "Niveau de Bloom", task parameters) based on the data received from the backend.
- [ ] **Implement Quiz Generation Trigger**: Modify the UI to trigger the quiz generation workflow *after* the necessary information has been gathered and confirmed through the chat interaction and UI field updates.

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

1.  **Refine Backend API for Chat**:
    *   Define new API endpoints (e.g., `/chat`, `/session`).
    *   Design request/response structures for chat messages and session state.
2.  **Develop Chat-Aware Agent Orchestration**:
    *   Modify the agent system's main entry point or create a new orchestrator agent that can maintain conversation history and route messages to specific agents based on the dialogue state and user intent.
    *   Ensure agents can return not just text responses but also structured data for UI updates.
3.  **Modify Generate UI for Chat Integration**:
    *   Remove hardcoded chat logic and state (`step`, `HARDCODED_SEQUENCE`).
    *   Implement logic to send the `input` message to the backend `/chat` endpoint.
    *   Process the response from the backend: add agent's text response to messages, update UI state based on any structured data for fields/parameters.
    *   Update loading/thinking indicators to reflect actual backend/agent processing.
4.  **Implement Dynamic UI Updates**:
    *   Write code in `src/pages/Generate.tsx` to read structured data from agent responses and use it to update the `taskParameters` state and potentially other UI elements.
5.  **Connect Quiz Generation to Chat Flow**:
    *   Modify the `handleGenerateMdpQuiz` function or create a new trigger that is activated based on the chat conversation reaching a "ready to generate" state, using the parameters gathered during the chat.