-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create waypoints table (Point geometry)
CREATE TABLE IF NOT EXISTS waypoints (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create lines table (LineString geometry)
CREATE TABLE IF NOT EXISTS lines (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create shapes table (Polygon geometry)
CREATE TABLE IF NOT EXISTS shapes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create spatial_ref_sys table (Optional system table for PostGIS)
CREATE TABLE IF NOT EXISTS spatial_ref_sys (
    srid INT PRIMARY KEY,
    auth_name VARCHAR(256),
    auth_srid INT,
    srtext VARCHAR(2048),
    proj4text VARCHAR(2048)
);
