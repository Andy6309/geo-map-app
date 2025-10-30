# Geospatial Map App - Setup Guide

## Overview

This is an interactive geospatial mapping application built with Next.js, Mapbox, and Supabase. It allows users to create, manage, and persist waypoints, lines, and areas on a map.

## Features

- **User Authentication**: Email/password authentication with Supabase
- **Waypoints**: Create point markers with custom names, colors, icons, and notes
- **Lines**: Draw lines with distance measurements
- **Areas**: Draw polygons with area calculations
- **Data Persistence**: All geospatial data is stored in PostgreSQL with PostGIS
- **User-specific Data**: Each user can only see and manage their own data

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Mapbox account and API token

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project dashboard: https://mougikqqyeybvphzskrg.supabase.co

2. Navigate to the **SQL Editor** in the left sidebar

3. Open the file `supabase/migrations/001_initial_schema.sql` in this project

4. Copy the entire contents and paste it into the SQL Editor

5. Click **Run** to execute the migration

This will:
- Enable the PostGIS extension for geospatial data
- Create tables for profiles, waypoints, lines, and areas
- Set up Row Level Security (RLS) policies
- Create indexes for better performance
- Set up triggers for automatic profile creation

### 2. Environment Variables

The `.env.local` file is already configured with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mougikqqyeybvphzskrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>
```

Make sure these values are correct.

### 3. Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3005

## Project Structure

```
geo-map-app/
├── app/
│   ├── api/                 # API routes
│   │   ├── waypoints/       # Waypoint CRUD operations
│   │   ├── lines/           # Line CRUD operations
│   │   └── areas/           # Area CRUD operations
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── layout.tsx           # Root layout with AuthProvider
│   └── page.tsx             # Main map page
├── components/
│   └── Map/                 # Map component and controls
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── api/                 # API client functions
│   └── supabase/            # Supabase client utilities
├── supabase/
│   └── migrations/          # Database migrations
└── middleware.ts            # Route protection middleware
```

## Usage

### Creating an Account

1. Navigate to http://localhost:3005/register
2. Enter your email and password
3. Click "Create account"
4. You'll be automatically logged in and redirected to the map

### Adding Waypoints

1. Click the waypoint button in the toolbar
2. A modal will appear with a marker at the center of the map
3. Drag the marker to your desired location
4. Fill in the name, notes, color, and icon type
5. Click "Save Waypoint"

### Drawing Lines

1. Click the line button in the toolbar
2. A modal will appear
3. Click on the map to add points to your line
4. The modal will show live distance measurements
5. Double-click or press Enter to finish the line
6. Fill in the name, notes, and color
7. Click "Save Line"

### Drawing Areas

1. Click the area button in the toolbar
2. A modal will appear
3. Click on the map to add points to your polygon
4. The modal will show live area measurements
5. Click the first point again to close the polygon
6. Fill in the name, notes, and color
7. Click "Save Area"

## API Endpoints

All API endpoints require authentication. The user's session is automatically validated via middleware.

### Waypoints

- `GET /api/waypoints` - Get all user's waypoints
- `POST /api/waypoints` - Create a new waypoint
- `PUT /api/waypoints` - Update a waypoint
- `DELETE /api/waypoints?id=<id>` - Delete a waypoint

### Lines

- `GET /api/lines` - Get all user's lines
- `POST /api/lines` - Create a new line
- `PUT /api/lines` - Update a line
- `DELETE /api/lines?id=<id>` - Delete a line

### Areas

- `GET /api/areas` - Get all user's areas
- `POST /api/areas` - Create a new area
- `PUT /api/areas` - Update an area
- `DELETE /api/areas?id=<id>` - Delete an area

## Database Schema

### profiles
- User profile information (extends auth.users)

### waypoints
- Point locations with properties (name, notes, color, icon)
- Uses PostGIS GEOGRAPHY(POINT, 4326)

### lines
- Line strings with distance measurements
- Uses PostGIS GEOGRAPHY(LINESTRING, 4326)

### areas
- Polygons with area measurements
- Uses PostGIS GEOGRAPHY(POLYGON, 4326)

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- All API routes validate user authentication
- Middleware protects routes and refreshes sessions

## Troubleshooting

### Database Connection Issues

If you see database errors:
1. Verify your Supabase URL and anon key in `.env.local`
2. Make sure you've run the migration script
3. Check that PostGIS extension is enabled

### Authentication Issues

If login/signup isn't working:
1. Check the browser console for errors
2. Verify Supabase credentials
3. Make sure the profiles table and trigger are created

### Map Not Loading

If the map doesn't appear:
1. Verify your Mapbox token in `.env.local`
2. Check browser console for errors
3. Make sure you're accessing the app at http://localhost:3005

## Next Steps

To integrate the Map component with the database:

1. Update the Map component to load saved waypoints, lines, and areas on mount
2. Call the API when saving new features
3. Add edit and delete functionality to existing features
4. Add a sidebar or list view to manage all features

See the `lib/api/geospatial.ts` file for the API client functions you can use in the Map component.
