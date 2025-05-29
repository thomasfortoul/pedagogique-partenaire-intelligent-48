# Database Schema

Here are the SQL `CREATE TABLE` statements for the Supabase database, based on the provided table view.

```sql
-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Foreign key linking to the users table
    title TEXT,
    description TEXT,
    level TEXT,
    summarized_pedago JSONB, -- Assuming this is a JSONB field for pedagogical summaries
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: predefined_tasks
CREATE TABLE predefined_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT,
    name TEXT,
    description TEXT,
    required_info_schema JSONB -- Assuming this is a JSONB field for schema
);

-- Table: chat_sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Foreign key linking to the users table
    course_id UUID REFERENCES courses(id), -- Foreign key linking to the courses table
    current_task_id UUID REFERENCES predefined_tasks(id), -- Foreign key linking to the predefined_tasks table
    context_summary JSONB, -- Assuming this is a JSONB field for chat context
    created_at TIMESTAMPTZ DEFAULT now(),
    last_interaction_at TIMESTAMPTZ DEFAULT now()
);

-- Table: generated_artifacts
CREATE TABLE generated_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id), -- Foreign key linking to the courses table
    user_id UUID REFERENCES users(id), -- Foreign key linking to the users table
    type TEXT,
    creation_date TIMESTAMPTZ DEFAULT now(),
    content JSONB, -- Assuming this is a JSONB field for the artifact content
    export_format TEXT,
    version_history JSONB -- Assuming this is a JSONB field for version history
);
```

## Table Relationships:

*   **`users`**: The central table for user information. `id` is its primary key. It is linked to `auth.users.id`, indicating integration with an authentication system. A user can be associated with multiple `courses`, `chat_sessions`, and `generated_artifacts`.
*   **`courses`**: Stores details about each course. `id` is its primary key. `user_id` is a foreign key referencing `users.id`, meaning each course belongs to a specific user. A course can have multiple `chat_sessions` and `generated_artifacts`.
*   **`predefined_tasks`**: Defines various tasks or workflows available in the system. `id` is its primary key. `chat_sessions.current_task_id` references this table, indicating the task a chat session is focused on.
*   **`chat_sessions`**: Manages the state and context of chat interactions. `id` is its primary key. It includes foreign keys `user_id` (from `users`), `course_id` (from `courses`), and `current_task_id` (from `predefined_tasks`), linking a session to a user, a course, and a specific task.
*   **`generated_artifacts`**: Stores the output documents (like exams or other generated content). `id` is its primary key. It has foreign keys `course_id` (from `courses`) and `user_id` (from `users`), associating each artifact with the course and user it was created for.