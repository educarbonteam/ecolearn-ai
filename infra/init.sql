-- EcoLearn AI Database Initialization Script
-- PostgreSQL 15+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_carbon_metrics_user_month ON carbon_metrics(user_id, year, month);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
    ('Planteur d''Arbres', '25 arbres plantés', 'TreePine', '{"trees_planted": 25}', 100),
    ('Apprenant Rapide', '10 cours complétés', 'Zap', '{"courses_completed": 10}', 150),
    ('Série Parfaite', '15 jours consécutifs', 'Target', '{"streak_days": 15}', 200),
    ('Éco-Champion', '100kg CO₂ compensés', 'Award', '{"carbon_offset": 100}', 250),
    ('Maître de l''IA', 'Cours avancés terminés', 'Brain', '{"advanced_courses": 3}', 300),
    ('Ambassadeur', 'Inviter 5 amis', 'Users', '{"referrals": 5}', 200)
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses for testing
INSERT INTO courses (title, description, category, duration, difficulty, modules, instructor, carbon_impact, is_published) VALUES
    (
        'Introduction à l''IA Responsable',
        'Apprenez les fondamentaux de l''intelligence artificielle avec une approche éthique et durable.',
        'Intelligence Artificielle',
        '4h 30min',
        'Débutant',
        8,
        'Dr. Marie Dubois',
        12.4,
        true
    ),
    (
        'Développement Durable en Entreprise',
        'Intégrez la durabilité dans votre stratégie d''entreprise avec des méthodes concrètes.',
        'Sustainability',
        '6h 15min',
        'Intermédiaire',
        12,
        'Jean-Luc Verdier',
        18.7,
        true
    ),
    (
        'Machine Learning pour la Transition Écologique',
        'Utilisez le machine learning pour résoudre des défis environnementaux.',
        'Data Science',
        '8h 00min',
        'Avancé',
        15,
        'Dr. Claire Fontaine',
        24.3,
        true
    ),
    (
        'Économie Circulaire & Innovation',
        'Découvrez les principes de l''économie circulaire et leur application pratique.',
        'Business',
        '5h 20min',
        'Intermédiaire',
        10,
        'Thomas Bernard',
        15.8,
        true
    )
ON CONFLICT DO NOTHING;

-- Create a view for platform statistics
CREATE OR REPLACE VIEW platform_stats AS
SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = true) as total_active_users,
    (SELECT COUNT(*) FROM courses WHERE is_published = true) as total_courses,
    (SELECT COALESCE(SUM(carbon_offset), 0) FROM users) as total_carbon_offset,
    (SELECT COALESCE(SUM(trees_planted), 0) FROM users) as total_trees_planted,
    (SELECT COUNT(*) FROM enrollments WHERE completed = true) as total_completions,
    (SELECT COUNT(DISTINCT user_id) FROM enrollments WHERE last_accessed > NOW() - INTERVAL '7 days') as active_learners_week;

-- Create a function to update user level based on progress
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.courses_completed >= 20 THEN
        NEW.level = 'Éco-Apprenant Expert';
    ELSIF NEW.courses_completed >= 10 THEN
        NEW.level = 'Éco-Apprenant Avancé';
    ELSIF NEW.courses_completed >= 5 THEN
        NEW.level = 'Éco-Apprenant Intermédiaire';
    ELSE
        NEW.level = 'Éco-Apprenant Débutant';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic level updates
DROP TRIGGER IF EXISTS trigger_update_user_level ON users;
CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.courses_completed IS DISTINCT FROM NEW.courses_completed)
    EXECUTE FUNCTION update_user_level();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecolearn;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecolearn;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ecolearn;

-- Create comment on tables
COMMENT ON TABLE users IS 'User accounts and profile information';
COMMENT ON TABLE courses IS 'Available courses with AI-generated content';
COMMENT ON TABLE enrollments IS 'User course enrollments and progress tracking';
COMMENT ON TABLE carbon_metrics IS 'Monthly carbon footprint metrics per user';
COMMENT ON TABLE tree_plantations IS 'Tree planting transactions via external API';
COMMENT ON TABLE achievements IS 'Available achievements and badges';
COMMENT ON TABLE user_achievements IS 'User achievement unlocks';

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE courses;
ANALYZE enrollments;
ANALYZE carbon_metrics;
