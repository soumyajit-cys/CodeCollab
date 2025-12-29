CREATE TABLE files (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  path VARCHAR(512) NOT NULL,
  language VARCHAR(50) NOT NULL,
  content TEXT,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX ix_files_owner_path ON files(owner_id, path);