-- Run this after schema_degrees.sql
USE learnfrontend_db;

CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    degree_id INT NOT NULL,
    user_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    grade VARCHAR(5) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (degree_id) REFERENCES degrees(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add total_credits column to degrees if not present
-- ALTER TABLE degrees ADD COLUMN total_credits INT NOT NULL DEFAULT 120;
