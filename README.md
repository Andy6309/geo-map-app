# Geospatial Map App

An interactive geospatial mapping application built with Next.js, Mapbox, and Supabase. Create, manage, and persist waypoints, lines, and areas on a map with user authentication and database storage.

## Features

- 🗺️ **Interactive Mapping** - Powered by Mapbox with multiple map styles
- 📍 **Waypoints** - Create point markers with custom names, colors, icons, and notes
- 📏 **Lines** - Draw lines with real-time distance measurements
- 📐 **Areas** - Draw polygons with area calculations
- 🔐 **User Authentication** - Secure email/password authentication
- 💾 **Data Persistence** - All geospatial data stored in PostgreSQL with PostGIS
- 👤 **User-specific Data** - Each user can only see and manage their own data
- 🔒 **Row Level Security** - Database-level security with Supabase RLS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Mapping**: Mapbox GL JS, Mapbox Draw, Turf.js
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS

## Quick Start

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the migration script from `supabase/migrations/001_initial_schema.sql`

4. **Configure environment variables**
   - Update `.env.local` with your Supabase and Mapbox credentials

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   - Navigate to [http://localhost:3005](http://localhost:3005)

## Detailed Setup

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## Project Structure

```
geo-map-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for CRUD operations
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── page.tsx           # Main map page
├── components/            # React components
│   └── Map/              # Map component and controls
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   ├── api/             # API client functions
│   └── supabase/        # Supabase client utilities
├── supabase/            # Database migrations
└── middleware.ts        # Route protection middleware
```

## API Documentation

All API endpoints require authentication:

- **Waypoints**: `/api/waypoints` (GET, POST, PUT, DELETE)
- **Lines**: `/api/lines` (GET, POST, PUT, DELETE)
- **Areas**: `/api/areas` (GET, POST, PUT, DELETE)

## Database Schema

- **profiles**: User profile information
- **waypoints**: Point locations with PostGIS GEOGRAPHY(POINT)
- **lines**: Line strings with PostGIS GEOGRAPHY(LINESTRING)
- **areas**: Polygons with PostGIS GEOGRAPHY(POLYGON)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
