-- Add company_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);

-- Add role column if it doesn't exist (for user roles within companies)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';