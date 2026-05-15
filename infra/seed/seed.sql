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

-- Job listings for all career roles
-- Role: Backend Developer
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('Backend Engineer', 'Tokopedia', 'Backend Developer', ARRAY['Go', 'PostgreSQL', 'Redis', 'Docker', 'Microservices', 'gRPC'], 'Build and maintain high-throughput backend services powering Indonesia''s largest marketplace.'),
('Senior Backend Developer', 'Gojek', 'Backend Developer', ARRAY['Go', 'Kafka', 'PostgreSQL', 'Kubernetes', 'CI/CD', 'REST API'], 'Design scalable backend systems for ride-hailing and payments serving millions of daily users.'),
('Backend Developer', 'Traveloka', 'Backend Developer', ARRAY['Java', 'Spring Boot', 'MySQL', 'Redis', 'AWS', 'Microservices'], 'Develop booking and payment services for Southeast Asia''s leading travel platform.'),
('Backend Engineer', 'Bukalapak', 'Backend Developer', ARRAY['Ruby', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'REST API'], 'Build reliable e-commerce APIs handling millions of transactions daily.'),
('Junior Backend Developer', 'Ruangguru', 'Backend Developer', ARRAY['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git', 'REST API'], 'Develop education platform APIs supporting real-time learning features.'),
('Backend Developer', 'Xendit', 'Backend Developer', ARRAY['Go', 'Node.js', 'PostgreSQL', 'Kafka', 'AWS', 'Security'], 'Build payment infrastructure APIs serving thousands of businesses across Southeast Asia.')
ON CONFLICT DO NOTHING;

-- Role: Frontend Developer
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('Frontend Engineer', 'Tokopedia', 'Frontend Developer', ARRAY['React', 'TypeScript', 'Next.js', 'CSS', 'Jest', 'GraphQL'], 'Build responsive and performant web interfaces for Indonesia''s top e-commerce platform.'),
('Senior Frontend Developer', 'Traveloka', 'Frontend Developer', ARRAY['React', 'TypeScript', 'Redux', 'Webpack', 'Performance Optimization', 'A/B Testing'], 'Lead frontend architecture for the travel booking experience across web and mobile web.'),
('Frontend Developer', 'Blibli', 'Frontend Developer', ARRAY['Vue.js', 'JavaScript', 'HTML', 'CSS', 'REST API', 'Git'], 'Develop customer-facing shopping features for a leading Indonesian e-commerce platform.'),
('Junior Frontend Developer', 'Ruangguru', 'Frontend Developer', ARRAY['React', 'JavaScript', 'Tailwind CSS', 'HTML', 'Git', 'Responsive Design'], 'Build interactive learning interfaces used by millions of Indonesian students.'),
('Frontend Engineer', 'Gojek', 'Frontend Developer', ARRAY['React', 'TypeScript', 'Next.js', 'Styled Components', 'Testing Library', 'CI/CD'], 'Create seamless user experiences for the Gojek super-app web platform.')
ON CONFLICT DO NOTHING;

-- Role: Full Stack Developer
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('Full Stack Developer', 'Shopee', 'Full Stack Developer', ARRAY['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'AWS'], 'Build end-to-end features for seller tools and internal platforms.'),
('Full Stack Engineer', 'Dana', 'Full Stack Developer', ARRAY['React', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'REST API'], 'Develop full-stack fintech features for Indonesia''s digital wallet platform.'),
('Full Stack Developer', 'Tiket.com', 'Full Stack Developer', ARRAY['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'], 'Build booking and discovery features spanning frontend and backend.'),
('Senior Full Stack Developer', 'Ajaib', 'Full Stack Developer', ARRAY['React', 'TypeScript', 'Go', 'PostgreSQL', 'Kubernetes', 'GraphQL'], 'Design and implement investment platform features from UI to database.'),
('Full Stack Developer', 'eFishery', 'Full Stack Developer', ARRAY['React', 'Node.js', 'PostgreSQL', 'Docker', 'Git', 'REST API'], 'Build aquaculture technology solutions connecting fish farmers to markets.')
ON CONFLICT DO NOTHING;

-- Role: Data Analyst
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('Data Analyst', 'Tokopedia', 'Data Analyst', ARRAY['SQL', 'Python', 'Tableau', 'Data Analysis', 'Statistics', 'Excel'], 'Analyze marketplace data to drive business decisions and optimize seller performance.'),
('Business Intelligence Analyst', 'Gojek', 'Data Analyst', ARRAY['SQL', 'Python', 'Looker', 'BigQuery', 'Statistics', 'Data Visualization'], 'Build dashboards and derive insights from ride-hailing and payments data.'),
('Data Analyst', 'Bank Jago', 'Data Analyst', ARRAY['SQL', 'Python', 'Power BI', 'Data Analysis', 'Financial Modeling', 'Excel'], 'Analyze digital banking data to improve customer experience and risk management.'),
('Junior Data Analyst', 'Bukalapak', 'Data Analyst', ARRAY['SQL', 'Python', 'Data Analysis', 'Excel', 'Google Analytics', 'Statistics'], 'Support data-driven decisions across marketing and product teams.'),
('Data Analyst', 'OVO', 'Data Analyst', ARRAY['SQL', 'Python', 'Tableau', 'Statistics', 'A/B Testing', 'Data Modeling'], 'Drive fintech product improvements through data analysis and experimentation.')
ON CONFLICT DO NOTHING;

-- Role: Data Scientist
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('Data Scientist', 'Gojek', 'Data Scientist', ARRAY['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics', 'Deep Learning'], 'Build ML models for pricing, demand forecasting, and fraud detection.'),
('Senior Data Scientist', 'Tokopedia', 'Data Scientist', ARRAY['Python', 'Machine Learning', 'NLP', 'PyTorch', 'SQL', 'Recommendation Systems'], 'Develop recommendation and search ranking algorithms for the marketplace.'),
('Data Scientist', 'Traveloka', 'Data Scientist', ARRAY['Python', 'Machine Learning', 'SQL', 'Spark', 'Statistics', 'A/B Testing'], 'Apply ML to dynamic pricing, personalization, and travel demand forecasting.'),
('Junior Data Scientist', 'Bukalapak', 'Data Scientist', ARRAY['Python', 'Machine Learning', 'SQL', 'Pandas', 'Scikit-learn', 'Statistics'], 'Build predictive models to enhance e-commerce user experience.'),
('Data Scientist', 'Xendit', 'Data Scientist', ARRAY['Python', 'Machine Learning', 'SQL', 'Feature Engineering', 'Fraud Detection', 'Statistics'], 'Develop ML models for payment fraud detection and risk scoring.')
ON CONFLICT DO NOTHING;

-- Role: AI / ML Engineer
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('ML Engineer', 'Gojek', 'AI / ML Engineer', ARRAY['Python', 'TensorFlow', 'Kubernetes', 'MLOps', 'Docker', 'Deep Learning'], 'Deploy and optimize ML models serving millions of real-time predictions.'),
('AI Engineer', 'Tokopedia', 'AI / ML Engineer', ARRAY['Python', 'PyTorch', 'NLP', 'Computer Vision', 'Docker', 'FastAPI'], 'Build AI systems for product search, image recognition, and chatbots.'),
('Machine Learning Engineer', 'Traveloka', 'AI / ML Engineer', ARRAY['Python', 'TensorFlow', 'Spark', 'AWS SageMaker', 'Feature Engineering', 'MLOps'], 'Build production ML pipelines for personalization and pricing optimization.'),
('AI Engineer', 'Prosa.ai', 'AI / ML Engineer', ARRAY['Python', 'NLP', 'Deep Learning', 'PyTorch', 'Bahasa Indonesia NLP', 'REST API'], 'Develop speech recognition and NLP models for Bahasa Indonesia.'),
('Junior ML Engineer', 'Nodeflux', 'AI / ML Engineer', ARRAY['Python', 'Computer Vision', 'TensorFlow', 'Docker', 'Git', 'Linux'], 'Build computer vision models for smart city and security applications.')
ON CONFLICT DO NOTHING;

-- Role: UI/UX Designer
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('UI/UX Designer', 'Tokopedia', 'UI/UX Designer', ARRAY['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing', 'Wireframing'], 'Design intuitive e-commerce experiences for millions of Indonesian users.'),
('Product Designer', 'Gojek', 'UI/UX Designer', ARRAY['Figma', 'User Research', 'Interaction Design', 'Design Thinking', 'Prototyping', 'A/B Testing'], 'Shape the user experience of Indonesia''s leading super-app.'),
('UX Designer', 'Traveloka', 'UI/UX Designer', ARRAY['Figma', 'User Research', 'Usability Testing', 'Information Architecture', 'Wireframing', 'UI Design'], 'Design seamless travel booking flows across web and mobile.'),
('Junior UI Designer', 'Bukalapak', 'UI/UX Designer', ARRAY['Figma', 'Adobe XD', 'UI Design', 'Visual Design', 'Typography', 'Color Theory'], 'Create visually appealing interfaces for marketplace features.'),
('UX Researcher', 'Dana', 'UI/UX Designer', ARRAY['User Research', 'Usability Testing', 'Survey Design', 'Data Analysis', 'Figma', 'Presentation'], 'Conduct user research to improve the digital wallet experience for Indonesian users.')
ON CONFLICT DO NOTHING;

-- Role: Product Manager
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('Product Manager', 'Tokopedia', 'Product Manager', ARRAY['Product Management', 'SQL', 'A/B Testing', 'Agile/Scrum', 'Data Analysis', 'Stakeholder Management'], 'Drive product strategy for seller tools serving millions of Indonesian merchants.'),
('Senior Product Manager', 'Gojek', 'Product Manager', ARRAY['Product Management', 'Data Analysis', 'User Research', 'Roadmap Planning', 'Agile/Scrum', 'OKRs'], 'Lead product development for transport and logistics features.'),
('Product Manager', 'Traveloka', 'Product Manager', ARRAY['Product Management', 'SQL', 'Data Analysis', 'A/B Testing', 'Agile/Scrum', 'Communication'], 'Own the product roadmap for flight and hotel booking experiences.'),
('Associate Product Manager', 'Shopee', 'Product Manager', ARRAY['Product Management', 'Data Analysis', 'Communication', 'Agile/Scrum', 'SQL', 'Problem Solving'], 'Support product initiatives across e-commerce buyer experience.'),
('Product Manager', 'Xendit', 'Product Manager', ARRAY['Product Management', 'Fintech', 'API Design', 'Data Analysis', 'Stakeholder Management', 'Agile/Scrum'], 'Define and deliver payment product features for businesses across Southeast Asia.')
ON CONFLICT DO NOTHING;

-- Role: DevOps Engineer
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('DevOps Engineer', 'Tokopedia', 'DevOps Engineer', ARRAY['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'AWS', 'Linux'], 'Build and maintain infrastructure supporting Indonesia''s largest e-commerce platform.'),
('Site Reliability Engineer', 'Gojek', 'DevOps Engineer', ARRAY['Kubernetes', 'Prometheus', 'Grafana', 'Go', 'Terraform', 'GCP'], 'Ensure 99.99% uptime for critical ride-hailing and payment services.'),
('DevOps Engineer', 'Traveloka', 'DevOps Engineer', ARRAY['AWS', 'Docker', 'Jenkins', 'Terraform', 'Python', 'Monitoring'], 'Manage cloud infrastructure and CI/CD pipelines for travel services.'),
('Cloud Engineer', 'Xendit', 'DevOps Engineer', ARRAY['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Security', 'Infrastructure as Code'], 'Build secure and scalable cloud infrastructure for payment processing.'),
('Junior DevOps Engineer', 'Blibli', 'DevOps Engineer', ARRAY['Docker', 'Linux', 'CI/CD', 'Git', 'Bash', 'Monitoring'], 'Support deployment pipelines and infrastructure for e-commerce services.')
ON CONFLICT DO NOTHING;

-- Role: Mobile Developer
INSERT INTO job_listings (title, company, role, required_skills, description) VALUES
('Android Developer', 'Gojek', 'Mobile Developer', ARRAY['Kotlin', 'Android SDK', 'MVVM', 'Retrofit', 'Coroutines', 'Jetpack Compose'], 'Build features for the Gojek Android app used by millions across Southeast Asia.'),
('iOS Developer', 'Tokopedia', 'Mobile Developer', ARRAY['Swift', 'UIKit', 'SwiftUI', 'Core Data', 'Combine', 'CI/CD'], 'Develop iOS app features for Indonesia''s largest e-commerce marketplace.'),
('Mobile Developer', 'Traveloka', 'Mobile Developer', ARRAY['React Native', 'TypeScript', 'Redux', 'REST API', 'Jest', 'Git'], 'Build cross-platform mobile features for travel booking and discovery.'),
('Flutter Developer', 'Dana', 'Mobile Developer', ARRAY['Flutter', 'Dart', 'REST API', 'State Management', 'Firebase', 'Git'], 'Develop the Dana digital wallet mobile app used by millions of Indonesians.'),
('Junior Mobile Developer', 'Ruangguru', 'Mobile Developer', ARRAY['Kotlin', 'Swift', 'REST API', 'Git', 'SQLite', 'Mobile UI'], 'Build educational features for the Ruangguru mobile learning platform.')
ON CONFLICT DO NOTHING;
