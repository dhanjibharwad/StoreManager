-- Add acceptance tracking columns to complaints table
ALTER TABLE complaints 
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN accepted_by UUID REFERENCES users(id);

-- Add index for better performance on accepted_by queries
CREATE INDEX idx_complaints_accepted_by ON complaints(accepted_by);

-- Add index for accepted_at for time-based queries
CREATE INDEX idx_complaints_accepted_at ON complaints(accepted_at);