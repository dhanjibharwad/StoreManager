-- Add missing columns to existing companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add missing columns to existing users table (role already exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;

-- Update role constraint to include new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role;
ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (
  role = ANY(ARRAY[
    'user'::text,
    'technician'::text, 
    'superadmin'::text,
    'rentaladmin'::text,
    'eventadmin'::text,
    'ecomadmin'::text,
    'admin'::text,
    'manager'::text,
    'supervisor'::text,
    'operator'::text,
    'engineer'::text
  ])
);

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_company 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public inserts on companies" ON companies;
CREATE POLICY "Allow public inserts on companies" ON companies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public reads on companies" ON companies;
CREATE POLICY "Allow public reads on companies" ON companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public inserts on users" ON users;
CREATE POLICY "Allow public inserts on users" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public reads on users" ON users;
CREATE POLICY "Allow public reads on users" ON users FOR SELECT USING (true);