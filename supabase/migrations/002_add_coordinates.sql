-- Add coordinates columns to store GeoJSON coordinates for easier frontend access
-- This duplicates the geometry data but makes it much easier to work with in JavaScript

ALTER TABLE public.lines ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE public.areas ADD COLUMN IF NOT EXISTS coordinates JSONB;

-- Add comments
COMMENT ON COLUMN public.lines.coordinates IS 'GeoJSON coordinates array for LineString';
COMMENT ON COLUMN public.areas.coordinates IS 'GeoJSON coordinates array for Polygon (outer ring only)';
