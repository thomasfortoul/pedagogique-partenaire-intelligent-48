# Pedagogique Partenaire Intelligent

## Handoff Documentation

A comprehensive handoff document for the ERGI project is available at [`HANDOFF_document.md`](HANDOFF_document.md). This document provides detailed information on the project's architecture, key features, technical details, and more, and is intended for new developers joining the project.

## Getting Started

To get started with the ERGI project, it is highly recommended to first review the comprehensive handoff documentation available at [`HANDOFF_document.md`](HANDOFF_document.md). Once you have a basic understanding of the project, follow the steps below to set up your development environment:

### 1. Clone the repository

To get started with the project, first clone the repository to your local machine:

```bash
git clone <repository_url>
cd pedagogique-partenaire-intelligent-48
```

### 2. Install Dependencies

Navigate to the project root directory and install the necessary dependencies using pnpm:

```bash
pnpm install
```

### 3. Start the Project

To run the application, you need to start both the development server and the API server.

First, start the development server from the project root:

```bash
pnpm dev
```

In a separate terminal, navigate to the `agents` directory and start the API server:

```bash
cd agents
adk api_server --allow_origins http://localhost:8080
