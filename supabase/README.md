# Database Setup Instructions

## Setting up the Supabase Database

1. Go to your Supabase project dashboard: https://mougikqqyeybvphzskrg.supabase.co

2. Navigate to the SQL Editor in the left sidebar

3. Copy and paste the contents of `migrations/001_initial_schema.sql` into the SQL Editor

4. Click "Run" to execute the migration

This will:
- Enable PostGIS extension for geospatial data
- Create tables for profiles, waypoints, lines, and areas
- Set up Row Level Security (RLS) policies
- Create indexes for better performance
- Set up triggers for automatic profile creation and timestamp updates

## Database Schema

### Tables

- **profiles**: User profile information (extends auth.users)
- **waypoints**: Point locations with properties (name, notes, color, icon)
- **lines**: Line strings with distance measurements
- **areas**: Polygons with area measurements

### Geospatial Features

All geospatial data uses the PostGIS extension with GEOGRAPHY type (SRID 4326 - WGS84).

- Waypoints store POINT geometry
- Lines store LINESTRING geometry
- Areas store POLYGON geometry

### Security

Row Level Security (RLS) is enabled on all tables. Users can only access their own data.
