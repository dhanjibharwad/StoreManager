-- Create user_invitations table
CREATE TABLE user_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invite_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_invitations_token ON user_invitations(invite_token);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_company ON user_invitations(company_id);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public inserts on user_invitations" ON user_invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads on user_invitations" ON user_invitations FOR SELECT USING (true);