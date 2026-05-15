-- Sample skill categories for development
INSERT INTO skills (name, category) VALUES
    ('Python', 'Programming Language'),
    ('JavaScript', 'Programming Language'),
    ('TypeScript', 'Programming Language'),
    ('Go', 'Programming Language'),
    ('SQL', 'Database'),
    ('PostgreSQL', 'Database'),
    ('React', 'Frontend Framework'),
    ('Next.js', 'Frontend Framework'),
    ('Tailwind CSS', 'Frontend Framework'),
    ('FastAPI', 'Backend Framework'),
    ('Gin', 'Backend Framework'),
    ('Docker', 'DevOps'),
    ('Git', 'DevOps'),
    ('Machine Learning', 'AI/ML'),
    ('Data Analysis', 'Data'),
    ('Figma', 'Design'),
    ('UI/UX Design', 'Design'),
    ('Product Management', 'Management'),
    ('Agile/Scrum', 'Management'),
    ('Communication', 'Soft Skill')
ON CONFLICT (name) DO NOTHING;

-- Sample test user (password: "password123")
-- WARNING: This hash is for development only. Never use in production.
INSERT INTO users (email, password_hash, full_name) VALUES
    ('test@siapkerja.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User')
ON CONFLICT (email) DO NOTHING;
