-- migrate:up

CREATE TABLE cv_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_aspiration VARCHAR(100) NOT NULL,
    cv_filename VARCHAR(255) NOT NULL,
    identified_skills JSONB NOT NULL DEFAULT '[]'
        CHECK (jsonb_typeof(identified_skills) = 'array'),
    skill_gaps JSONB NOT NULL DEFAULT '[]'
        CHECK (jsonb_typeof(skill_gaps) = 'array'),
    matching_skills JSONB NOT NULL DEFAULT '[]'
        CHECK (jsonb_typeof(matching_skills) = 'array'),
    required_skills JSONB NOT NULL DEFAULT '[]'
        CHECK (jsonb_typeof(required_skills) = 'array'),
    roadmap JSONB NOT NULL DEFAULT '[]'
        CHECK (jsonb_typeof(roadmap) = 'array'),
    experience_level VARCHAR(20) NOT NULL DEFAULT '',
    cv_summary TEXT NOT NULL DEFAULT '',
    jobs_analyzed INT NOT NULL DEFAULT 0,
    estimated_duration VARCHAR(50) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cv_analyses_user_id_created ON cv_analyses(user_id, created_at DESC);

-- migrate:down
DROP TABLE IF EXISTS cv_analyses;
