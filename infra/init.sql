-- EcoLearn AI - PostgreSQL Initialization Script
-- Ordre correct : Extensions → Tables → Indexes → Data → Views → Functions

-- ============================================
-- 1. EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 2. TABLES
-- ============================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    avatar VARCHAR DEFAULT '',
    level VARCHAR DEFAULT 'Éco-Apprenant Débutant',
    total_learning_hours FLOAT DEFAULT 0.0,
    courses_completed INTEGER DEFAULT 0,
    carbon_offset FLOAT DEFAULT 0.0,
    trees_planted INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: courses
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50) DEFAULT 'intermediate',
    duration VARCHAR(50),
    modules INTEGER DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    rating FLOAT DEFAULT 0,
    instructor VARCHAR(255),
    carbon_impact FLOAT DEFAULT 0,
    thumbnail_url TEXT,
    content JSONB,
    ai_generated BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    progress FLOAT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Table: carbon_metrics
CREATE TABLE IF NOT EXISTS carbon_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    carbon_offset FLOAT DEFAULT 0,
    learning_hours FLOAT DEFAULT 0,
    trees_equivalent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, year, month)
);

-- Table: tree_plantations
CREATE TABLE IF NOT EXISTS tree_plantations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trees_count INTEGER NOT NULL,
    location VARCHAR(255),
    organization VARCHAR(255) DEFAULT 'Tree-Nation',
    api_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    carbon_equivalent FLOAT,
    certificate_url TEXT,
    planted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: achievements
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    condition_type VARCHAR(100),
    condition_value INTEGER,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 3. INDEXES (APRÈS LES TABLES)
-- ============================================

-- Index sur email pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index sur category pour filtrage
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Index composite pour les enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);

-- Index pour les métriques carbon
CREATE INDEX IF NOT EXISTS idx_carbon_metrics_user_date ON carbon_metrics(user_id, year, month);

-- ============================================
-- 4. DONNÉES INITIALES
-- ============================================

-- Insérer des achievements par défaut
INSERT INTO achievements (name, description, icon, condition_type, condition_value, points)
VALUES 
    ('Premier Pas', 'Complétez votre premier cours', '🎯', 'courses_completed', 1, 10),
    ('Apprenant Assidu', 'Complétez 5 cours', '📚', 'courses_completed', 5, 50),
    ('Expert', 'Complétez 10 cours', '🎓', 'courses_completed', 10, 100),
    ('Écolo Débutant', 'Plantez votre premier arbre', '🌱', 'trees_planted', 1, 10),
    ('Gardien de la Forêt', 'Plantez 10 arbres', '🌳', 'trees_planted', 10, 50),
    ('Champion du Climat', 'Compensez 100kg de CO₂', '🌍', 'carbon_offset', 100, 100)
ON CONFLICT DO NOTHING;

-- Insérer des cours de démonstration
INSERT INTO courses (title, description, category, difficulty, duration, modules, instructor, carbon_impact, is_published)
VALUES 
    (
        'Introduction à l''Intelligence Artificielle',
        'Découvrez les bases de l''IA et ses applications dans le développement durable',
        'AI',
        'beginner',
        '8h',
        6,
        'Dr. Sophie Martin',
        12.5,
        TRUE
    ),
    (
        'Data Science pour l''Écologie',
        'Analysez des données environnementales et créez des modèles prédictifs',
        'Data Science',
        'intermediate',
        '15h',
        8,
        'Prof. Jean Dupont',
        18.0,
        TRUE
    ),
    (
        'Développement Durable et Technologies Vertes',
        'Explorez les solutions technologiques pour un avenir durable',
        'Sustainability',
        'beginner',
        '10h',
        7,
        'Marie Leclerc',
        8.5,
        TRUE
    ),
    (
        'Machine Learning Avancé',
        'Techniques avancées de ML pour résoudre des problèmes complexes',
        'AI',
        'advanced',
        '20h',
        12,
        'Dr. Thomas Bernard',
        25.0,
        TRUE
    )
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. VUES
-- ============================================

-- Vue pour les statistiques de la plateforme
CREATE OR REPLACE VIEW platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COALESCE(SUM(carbon_offset), 0) FROM users) as total_carbon_offset,
    (SELECT COALESCE(SUM(trees_planted), 0) FROM users) as total_trees_planted,
    (SELECT COUNT(*) FROM users WHERE total_learning_hours > 0) as active_learners;

-- ============================================
-- 6. FONCTIONS & TRIGGERS
-- ============================================

-- Fonction pour mettre à jour le niveau de l'utilisateur
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour du niveau basé sur les cours complétés
    NEW.level := CASE
        WHEN NEW.courses_completed >= 20 THEN 5
        WHEN NEW.courses_completed >= 10 THEN 4
        WHEN NEW.courses_completed >= 5 THEN 3
        WHEN NEW.courses_completed >= 2 THEN 2
        ELSE 1
    END;
    
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le niveau
DROP TRIGGER IF EXISTS trigger_update_user_level ON users;
CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger updated_at sur les tables nécessaires
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_courses_updated_at ON courses;
CREATE TRIGGER trigger_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. PERMISSIONS
-- ============================================

-- Accorder les permissions nécessaires
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecolearn;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecolearn;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ecolearn;

-- ============================================
-- FIN DE L'INITIALISATION
-- ============================================

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données EcoLearn AI initialisée avec succès !';
    RAISE NOTICE '📊 Tables créées: users, courses, enrollments, carbon_metrics, tree_plantations, achievements, user_achievements';
    RAISE NOTICE '🎯 Achievements par défaut: 6 badges';
    RAISE NOTICE '📚 Cours de démo: 4 cours';
END $$;