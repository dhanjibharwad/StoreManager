-- Fix complaints table schema - add missing technician fields
-- Execute this in your Supabase SQL editor

-- Add missing columns to complaints table
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS technician_remarks TEXT,
ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS work_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Update existing complaints to have proper status values
UPDATE complaints 
SET status = 'pending' 
WHERE status IS NULL OR status = '';

-- Create index for better performance on technician queries
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);