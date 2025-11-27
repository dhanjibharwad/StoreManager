-- Add service_charge column to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS service_charge DECIMAL(10,2) DEFAULT 0;

-- Update complaints table to ensure all necessary columns exist
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);