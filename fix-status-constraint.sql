-- First, check what status values exist
SELECT DISTINCT status FROM complaints;

-- Update any invalid status values to 'pending'
UPDATE complaints 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'in_progress', 'resolved', 'closed');

-- Drop the existing check constraint
ALTER TABLE complaints DROP CONSTRAINT IF EXISTS complaints_status_check;

-- Add the new check constraint with all required status values
ALTER TABLE complaints ADD CONSTRAINT complaints_status_check 
CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed'));