-- Change existing datetime columns to timezone-aware format
ALTER TABLE availability 
ALTER COLUMN start_time TYPE TIMESTAMPTZ USING start_time AT TIME ZONE 'America/Toronto',
ALTER COLUMN end_time TYPE TIMESTAMPTZ; 