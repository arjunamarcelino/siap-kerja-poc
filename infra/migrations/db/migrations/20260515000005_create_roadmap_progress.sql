-- migrate:up

CREATE TABLE roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES cv_analyses(id) ON DELETE CASCADE,
    progress JSONB NOT NULL DEFAULT '{}'
        CHECK (jsonb_typeof(progress) = 'object'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, analysis_id)
);

CREATE INDEX idx_roadmap_progress_analysis_id ON roadmap_progress(analysis_id);

CREATE TRIGGER set_roadmap_progress_updated_at
    BEFORE UPDATE ON roadmap_progress
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- migrate:down
DROP TRIGGER IF EXISTS set_roadmap_progress_updated_at ON roadmap_progress;
DROP TABLE IF EXISTS roadmap_progress;
