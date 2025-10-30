# Quick Start - Database Setup

## IMPORTANT: You must complete this step before you can login!

### Step 1: Go to Supabase Dashboard

1. Open your browser and go to: **https://supabase.com/dashboard/project/mougikqqyeybvphzskrg**
2. Login to your Supabase account

### Step 2: Open SQL Editor

1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"** button

### Step 3: Run the Migration

1. Open the file: `supabase/migrations/001_initial_schema.sql` in this project
2. Copy ALL the contents (it's a long file - about 180 lines)
3. Paste it into the SQL Editor in Supabase
4. Click **"Run"** button (or press Ctrl+Enter)

### Step 4: Verify Tables Were Created

1. In the left sidebar, click on **"Table Editor"**
2. You should see these tables:
   - `profiles`
   - `waypoints`
   - `lines`
   - `areas`

### What This Does

- **Enables PostGIS** for geospatial data
- **Creates tables** for your map data
- **Sets up Row Level Security** so users can only see their own data
- **Creates triggers** for automatic profile creation when users sign up

### After Running Migration

1. Go back to your app: http://localhost:3005/register
2. Create an account with your email and password
3. Login and start using the map!

## Troubleshooting

**If you get an error about PostGIS:**
- Make sure you're using a Supabase project (not a local database)
- PostGIS is pre-installed on all Supabase projects

**If tables already exist:**
- The migration will fail if you've already run it
- That's okay! Just check the Table Editor to confirm tables exist

**If you can't login after creating an account:**
- Check your email for a confirmation link from Supabase
- Or go to Supabase Dashboard > Authentication > Users to verify your account was created
