-- migrate:up
CREATE TABLE job_listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_listings_role ON job_listings (role);

-- migrate:down
DROP TABLE IF EXISTS job_listings;
