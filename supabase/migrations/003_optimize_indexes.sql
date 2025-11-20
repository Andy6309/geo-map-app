-- Optimization migration: Add composite indexes for faster data loading
-- This migration adds composite indexes to speed up the common query pattern:
-- SELECT * FROM table WHERE user_id = X ORDER BY created_at DESC

-- Composite index for waypoints (user_id + created_at)
-- This allows the database to efficiently filter by user and sort by date in one operation
CREATE INDEX IF NOT EXISTS idx_waypoints_user_created 
  ON public.waypoints(user_id, created_at DESC);

-- Composite index for lines (user_id + created_at)
CREATE INDEX IF NOT EXISTS idx_lines_user_created 
  ON public.lines(user_id, created_at DESC);

-- Composite index for areas (user_id + created_at)
CREATE INDEX IF NOT EXISTS idx_areas_user_created 
  ON public.areas(user_id, created_at DESC);

-- Add BRIN indexes for created_at columns for better range query performance
-- BRIN indexes are much smaller and faster for time-series data
CREATE INDEX IF NOT EXISTS idx_waypoints_created_brin 
  ON public.waypoints USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_lines_created_brin 
  ON public.lines USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_areas_created_brin 
  ON public.areas USING BRIN(created_at);

-- Analyze tables to update statistics for query planner
ANALYZE public.waypoints;
ANALYZE public.lines;
ANALYZE public.areas;
