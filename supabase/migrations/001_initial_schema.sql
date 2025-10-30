-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waypoints table
CREATE TABLE IF NOT EXISTS public.waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  color TEXT DEFAULT 'red',
  icon_type TEXT DEFAULT 'deer',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lines table
CREATE TABLE IF NOT EXISTS public.lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  color TEXT DEFAULT '#e53935',
  geometry GEOGRAPHY(LINESTRING, 4326) NOT NULL,
  total_distance DOUBLE PRECISION, -- in meters
  segment_distances JSONB, -- array of segment distances
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create areas table
CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  color TEXT DEFAULT '#1976d2',
  geometry GEOGRAPHY(POLYGON, 4326) NOT NULL,
  total_area DOUBLE PRECISION, -- in square meters
  perimeter DOUBLE PRECISION, -- in meters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_waypoints_user_id ON public.waypoints(user_id);
CREATE INDEX IF NOT EXISTS idx_waypoints_location ON public.waypoints USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_lines_user_id ON public.lines(user_id);
CREATE INDEX IF NOT EXISTS idx_lines_geometry ON public.lines USING GIST(geometry);

CREATE INDEX IF NOT EXISTS idx_areas_user_id ON public.areas(user_id);
CREATE INDEX IF NOT EXISTS idx_areas_geometry ON public.areas USING GIST(geometry);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for waypoints
CREATE POLICY "Users can view their own waypoints"
  ON public.waypoints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waypoints"
  ON public.waypoints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waypoints"
  ON public.waypoints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waypoints"
  ON public.waypoints FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for lines
CREATE POLICY "Users can view their own lines"
  ON public.lines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lines"
  ON public.lines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lines"
  ON public.lines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lines"
  ON public.lines FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for areas
CREATE POLICY "Users can view their own areas"
  ON public.areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own areas"
  ON public.areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own areas"
  ON public.areas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own areas"
  ON public.areas FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_waypoints
  BEFORE UPDATE ON public.waypoints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_lines
  BEFORE UPDATE ON public.lines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_areas
  BEFORE UPDATE ON public.areas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
