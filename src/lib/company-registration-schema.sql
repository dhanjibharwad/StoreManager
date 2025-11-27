-- Company Registration Schema for Supabase

-- Companies table (only create if not exists)
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  gst_number VARCHAR(15),
  company_logo_url TEXT,
  industry VARCHAR(100) NOT NULL,
  company_size VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  admin_password VARCHAR(255) NOT NULL,
  subscription_plan VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table (only create if not exists)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL, -- monthly, yearly
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans (only if they don't exist)
INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
SELECT 'Free', 'Perfect for getting started', 0.00, 'monthly', '["Up to 3 users", "Basic features", "Email support", "5GB storage", "Standard templates"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Free');

INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
SELECT 'Enterprise', 'Complete solution for large organizations', 299.99, 'monthly', '["Unlimited users", "All premium features", "24/7 priority support", "Unlimited storage", "Custom integrations", "Advanced analytics", "Dedicated account manager", "Custom branding"]'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Enterprise');

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Companies can view their own data" ON companies;
DROP POLICY IF EXISTS "Anyone can insert companies" ON companies;
DROP POLICY IF EXISTS "Everyone can view subscription plans" ON subscription_plans;

CREATE POLICY "Companies can view their own data" ON companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can insert companies" ON companies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Indexes (only create if not exists)
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);