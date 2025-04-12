-- Create databases
CREATE DATABASE farm_db;
CREATE DATABASE user_db;

-- Connect to farm_db
\c farm_db;

-- Create tables for farm_db
CREATE TABLE farms (
  farm_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  size FLOAT NOT NULL,
  crop_types TEXT[] NOT NULL,
  last_updated TIMESTAMP NOT NULL,
  owner_id VARCHAR(36) NOT NULL
);

CREATE INDEX farm_owner_idx ON farms(owner_id);

CREATE TABLE daily_checks (
  check_id VARCHAR(36) PRIMARY KEY,
  farm_id VARCHAR(36) NOT NULL,
  check_date TIMESTAMP NOT NULL,
  weather VARCHAR(50),
  temperature FLOAT,
  humidity FLOAT,
  soil_condition VARCHAR(100),
  crop_status VARCHAR(100),
  notes TEXT,
  created_by VARCHAR(36) NOT NULL
);

CREATE INDEX checks_farm_idx ON daily_checks(farm_id);
CREATE INDEX checks_date_idx ON daily_checks(check_date);

CREATE TABLE check_images (
  image_id VARCHAR(36) PRIMARY KEY,
  check_id VARCHAR(36) NOT NULL,
  url VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL
);

CREATE INDEX images_check_idx ON check_images(check_id);

CREATE TABLE farm_investors (
  farm_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  investment_amount FLOAT NOT NULL,
  investment_date TIMESTAMP NOT NULL,
  PRIMARY KEY (farm_id, user_id)
);

CREATE TABLE notifications (
  notification_id VARCHAR(36) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  farm_id VARCHAR(36),
  check_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  message VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX notifications_user_idx ON notifications(user_id);

-- Connect to user_db
\c user_db;

-- Create tables for user_db
CREATE TABLE users (
  user_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL,
  last_login TIMESTAMP,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX user_email_idx ON users(email);

CREATE TABLE notification_settings (
  user_id VARCHAR(36) PRIMARY KEY,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  event_types TEXT[]
);

-- Create an initial admin user (password: Admin123!)
INSERT INTO users (user_id, name, email, password, role, created_at, active)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Admin User',
  'admin@agritrack.com',
  -- This is a bcrypt hash of 'Admin123!'
  '$2b$10$C7N1.HLQz.MHCv5hELEIu.yDaj6tX1vqQMF7kAkF3JNr1MNfKJdI2',
  'admin',
  NOW(),
  TRUE
);