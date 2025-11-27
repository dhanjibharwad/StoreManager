-- Add assigned_to field to complaints table
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);

-- Update existing complaints to have pending status if not set
UPDATE complaints 
SET status = 'pending' 
WHERE status IS NULL OR status = '';

-- Add technician role to users if not exists
UPDATE users 
SET role = 'technician' 
WHERE role IS NULL AND email LIKE '%tech%';

-- You can manually set technician role for specific users:
-- UPDATE users SET role = 'technician' WHERE email = 'technician@example.com';