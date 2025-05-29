# Course Planning and Assessment Generation System

An AI-powered system for automated course planning and assessment generation, built using Google's Agent Development Kit (ADK).

## Features

- **Document Summarization**: Extract objectives, topics, and Bloom's taxonomy levels from course documents
- **Course Planning**: Generate structured course outlines and syllabi from learning objectives
- **Assessment Generation**: Create various types of assessments (quizzes, exams, projects) aligned with learning objectives
- **Bloom's Taxonomy Alignment**: Ensure assessments target appropriate cognitive levels
- **Resource Recommendations**: Suggest learning resources for course topics

## Architecture

The system is built around a set of specialized agents with different roles:

- **Document Pipeline Agents**: Process and analyze educational documents
- **Learning Objective Agents**: Draft and refine Bloom-aligned learning objectives
- **Syllabus Planner Agents**: Structure modules and sessions into coherent syllabi
- **Assessment Generator Agents**: Create diverse assessment items matched to objectives
- **Orchestration Agents**: Coordinate the workflows and agent interactions

## Getting Started

### Prerequisites

- Python 3.8+
- Google ADK package (`google-adk`)
- Other dependencies listed in requirements.txt

### Installation

1. Create and activate a virtual environment:
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. Install required packages:
   ```
   pip install -r requirements.txt
   ```

3. Set up Google ADK authentication as needed

### Usage

The system can be used in several modes:

#### Document Processing

Process a document and extract course information:

```
python main.py document path/to/document.pdf --course-name "Course Title"
```

#### Course Planning

Generate a course outline:

```
python main.py plan --objectives "Objective 1, Objective 2, Objective 3" --duration 12
```

#### Assessment Generation

Create assessments for a course:

```
python main.py assessment --course-id <course_id> --type quiz
```

#### Interactive Mode

Start the interactive command-line interface:

```
python main.py interactive
```

#### Running Tests

Run the test suite:

```
python main.py test
```

## Project Structure

- `models.py`: Core data models (Course, TaskDocument, UserInteractionState)
- `tools.py`: Custom tools for course planning and assessment
- `document_pipeline.py`: Document processing pipeline and related agents
- `agentic_workflow_system.py`: Main agent implementations and orchestration
- `main.py`: Command-line interface and entry point

## Agent Types

- **LlmAgent**: For free-form text generation (e.g., learning objectives, assessment items)
- **SequentialAgent**: For linear, staged pipelines (e.g., course preparation workflow)
- **LoopAgent**: For iterative refinement (e.g., objective improvement until criteria met)
- **ContentRoutingAgent**: For dynamic routing based on request analysis

## Session and Memory Management

The system uses:
- `InMemorySessionService` for development
- `VertexAiSessionService` for production (when deployed)
- Memory services to store and retrieve course data, alignment rules, etc.

## References

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [ADK API Reference](https://google.github.io/adk-docs/api-reference/index.html)
- [HEC Montréal's Pedagogical Resources](https://enseigner.hec.ca/pedagogie) (Used to inform pedagogical aspects)

## Pedagogical Foundation

This system is built on solid pedagogical principles including:
- **Constructive Alignment**: Ensuring coherence between objectives, activities, and assessments
- **Bloom's Taxonomy**: Targeting appropriate cognitive levels in objectives and assessments
- **Active Learning**: Suggesting activities that promote student engagement
- **Inclusive Design**: Considering diverse learner needs in the planning process

## License

[Your License Information]

## Contributors

[Contributor Information] 