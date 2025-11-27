-- Remove job_type column from complaints table if it exists
ALTER TABLE complaints DROP COLUMN IF EXISTS job_type;