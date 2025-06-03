-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  course_id uuid,
  current_task_id uuid,
  context_summary jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  last_interaction_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT chat_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT chat_sessions_current_task_id_fkey FOREIGN KEY (current_task_id) REFERENCES public.predefined_tasks(id),
  CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  description text,
  level text,
  summarized_pedagogical_info jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.generated_artifacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  user_id uuid,
  type text,
  creation_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  content jsonb,
  export_format text,
  version_history jsonb,
  CONSTRAINT generated_artifacts_pkey PRIMARY KEY (id),
  CONSTRAINT generated_artifacts_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT generated_artifacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.predefined_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category text CHECK (category = ANY (ARRAY['PRESENTATION'::text, 'PREPARATION'::text, 'EVALUATION'::text])),
  name text NOT NULL,
  description text,
  required_info_schema jsonb,
  CONSTRAINT predefined_tasks_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name text,
  role text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);