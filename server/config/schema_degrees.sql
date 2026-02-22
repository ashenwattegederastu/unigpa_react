-- Run this after the initial schema.sql
USE learnfrontend_db;

CREATE TABLE IF NOT EXISTS degrees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    grading_scale VARCHAR(10) NOT NULL DEFAULT '4.0',
    duration_years INT NOT NULL DEFAULT 3,
    current_semester INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- If you already created the table without these columns, run:
-- ALTER TABLE degrees ADD COLUMN duration_years INT NOT NULL DEFAULT 3;
-- ALTER TABLE degrees ADD COLUMN current_semester INT NOT NULL DEFAULT 1;
