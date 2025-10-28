-- Web Planner Database Schema with Multi-User Support
-- Run this in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS web_planner;
USE web_planner;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table (linked to users)
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_time TIME,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Update existing tasks with old status values
UPDATE tasks SET status = 'todo' WHERE status = 'pending';
UPDATE tasks SET status = 'in-progress' WHERE status = 'in_progress';

-- Events table for calendar (linked to users)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    location VARCHAR(500),
    color VARCHAR(7) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notes table (linked to users)
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert demo user (password: demo123)
INSERT IGNORE INTO users (username, password, email) VALUES
('demo', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'demo@example.com');

-- Get demo user ID for sample data
SET @demo_user_id = (SELECT id FROM users WHERE username = 'demo');

-- Insert sample tasks for demo user
INSERT INTO tasks (user_id, title, description, due_date, priority, category) VALUES
(@demo_user_id, 'Complete project proposal', 'Write and submit the quarterly project proposal', '2025-11-01', 'high', 'Work'),
(@demo_user_id, 'Buy groceries', 'Milk, bread, eggs, vegetables', '2025-10-28', 'medium', 'Personal'),
(@demo_user_id, 'Schedule dentist appointment', 'Annual checkup', '2025-11-05', 'low', 'Health');

-- Insert sample events for demo user
INSERT INTO events (user_id, title, description, start_datetime, end_datetime, color) VALUES
(@demo_user_id, 'Team Meeting', 'Weekly team standup', '2025-10-28 10:00:00', '2025-10-28 11:00:00', '#10b981'),
(@demo_user_id, 'Lunch with Sarah', 'Catch up meeting', '2025-10-29 12:30:00', '2025-10-29 13:30:00', '#f59e0b'),
(@demo_user_id, 'Project Deadline', 'Final submission', '2025-11-01 17:00:00', '2025-11-01 17:30:00', '#ef4444');

-- Insert sample notes for demo user
INSERT INTO notes (user_id, title, content) VALUES
(@demo_user_id, 'Meeting Notes - Oct 25', 'Discussed new features for Q4. Need to prioritize user authentication and dashboard improvements.'),
(@demo_user_id, 'Ideas for Website', 'Consider adding dark mode, improve mobile responsiveness, add search functionality.');