-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'US/Eastern')
);

-- Create waypoints table (Point geometry)
CREATE TABLE IF NOT EXISTS waypoints (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    geom GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'US/Eastern')
);

-- Create lines table (LineString geometry)
CREATE TABLE IF NOT EXISTS lines (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    geom GEOGRAPHY(LINESTRING, 4326),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'US/Eastern')
);

-- Create shapes table (Polygon geometry)
CREATE TABLE IF NOT EXISTS shapes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    geom GEOGRAPHY(POLYGON, 4326),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'US/Eastern')
);
