-- migrate:up
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    embedding vector(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_embedding ON skills USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_skills_category ON skills(category);

-- migrate:down
DROP TABLE IF EXISTS skills;
