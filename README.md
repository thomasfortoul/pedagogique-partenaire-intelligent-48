# Pedagogique Partenaire Intelligent

## Getting Started

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
