-- Database: green_campus
CREATE DATABASE IF NOT EXISTS green_campus;
USE green_campus;

-- 🌳 Trees table
CREATE TABLE trees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tree_name VARCHAR(100),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    health_status ENUM('healthy', 'unhealthy') DEFAULT 'healthy',
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💧 Drainages table
CREATE TABLE drainages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drainage_name VARCHAR(100),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    status ENUM('cleaned', 'uncleaned') DEFAULT 'uncleaned',
    last_cleaned TIMESTAMP NULL
);

-- ⚠️ Alerts table
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type ENUM('danger', 'warning', 'info') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE
);

-- 📡 Telemetry table (drone or IoT sensors)
CREATE TABLE telemetry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    metric_type ENUM('tree_health', 'drainage', 'movement', 'other') NOT NULL,
    metric_value VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔗 Example relation: link telemetry → trees
ALTER TABLE telemetry
ADD COLUMN tree_id INT NULL,
ADD FOREIGN KEY (tree_id) REFERENCES trees(id);

-- 🔗 Example relation: link telemetry → drainages
ALTER TABLE telemetry
ADD COLUMN drainage_id INT NULL,
ADD FOREIGN KEY (drainage_id) REFERENCES drainages(id);
