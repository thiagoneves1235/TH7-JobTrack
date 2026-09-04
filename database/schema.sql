-- TH7 JobTrack - modelo relacional PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  headline VARCHAR(180),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE application_status AS ENUM ('saved', 'pending', 'interview', 'offer', 'rejected');

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(140) NOT NULL,
  role VARCHAR(180) NOT NULL,
  location VARCHAR(120),
  job_url TEXT,
  status application_status NOT NULL DEFAULT 'saved',
  applied_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  kind VARCHAR(80) NOT NULL,
  meeting_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE career_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX applications_user_status_idx ON applications(user_id, status);
CREATE INDEX interviews_schedule_idx ON interviews(scheduled_at);
CREATE INDEX tasks_user_due_date_idx ON career_tasks(user_id, due_date);
