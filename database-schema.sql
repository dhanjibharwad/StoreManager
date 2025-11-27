-- Companies table (if not exists, create it)
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  website TEXT,
  gst_number TEXT,
  company_logo_url TEXT,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  subscription_plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add status column if companies table already exists
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  department TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Allow public inserts on companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads on companies" ON companies FOR SELECT USING (true);

-- RLS Policies for users
CREATE POLICY "Allow public inserts on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads on users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can view users from same company" ON users FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM users WHERE email = auth.jwt() ->> 'email'
  )
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);

-- Sample data (optional)
INSERT INTO companies (company_name, email, phone, industry, company_size, address, city, state, country, postal_code, subscription_plan) VALUES
('Tech Solutions Inc', 'admin@techsolutions.com', '+1234567890', 'technology', '11-50', '123 Tech Street', 'San Francisco', 'CA', 'USA', '94105', 'enterprise'),
('Health Care Ltd', 'admin@healthcare.com', '+1234567891', 'healthcare', '51-200', '456 Health Ave', 'New York', 'NY', 'USA', '10001', 'free')
ON CONFLICT (email) DO NOTHING;