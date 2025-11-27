-- Complaints table schema
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  device_name TEXT NOT NULL,
  model_number TEXT NOT NULL,
  year_of_purchase INTEGER NOT NULL,
  details TEXT,
  attachments TEXT[], -- Array of file URLs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for complaint attachments (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Set up RLS policies for complaints table
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own complaints
CREATE POLICY "Users can view own complaints" ON complaints
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own complaints
CREATE POLICY "Users can insert own complaints" ON complaints
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own complaints (limited fields)
CREATE POLICY "Users can update own complaints" ON complaints
  FOR UPDATE USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Admins can view all complaints (you'll need to implement admin role check)
-- CREATE POLICY "Admins can view all complaints" ON complaints
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE users.id::text = auth.uid()::text 
--       AND users.role IN ('superadmin', 'admin')
--     )
--   );