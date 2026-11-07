CREATE TABLE IF NOT EXISTS profiles (
  id text PRIMARY KEY, name text NOT NULL, handle text NOT NULL UNIQUE, bio text NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id text PRIMARY KEY, author_id text NOT NULL REFERENCES profiles(id), body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), likes integer NOT NULL DEFAULT 0 CHECK (likes >= 0)
);
INSERT INTO profiles (id, name, handle, bio) VALUES
  ('profile-1', 'Sora Tanaka', 'sora', 'Building a small corner of the internet, one experiment at a time.')
ON CONFLICT (id) DO NOTHING;
INSERT INTO posts (id, author_id, body, created_at, likes) VALUES
  ('post-1', 'profile-1', 'A faster web starts with the first response. This page streams its content from the server.', '2026-11-04 09:00:00+00', 128),
  ('post-2', 'profile-1', 'GraphQL describes the data. Relay keeps the components in sync. PostgreSQL keeps it safe.', '2026-11-03 12:30:00+00', 64),
  ('post-3', 'profile-1', 'Small experiments are a great way to understand how a stack fits together.', '2026-11-02 08:15:00+00', 42)
ON CONFLICT (id) DO NOTHING;
