-- Updated complaints table schema to match the comprehensive form
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Information
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  source TEXT,
  referred_by TEXT,
  service_type TEXT,
  job_type TEXT,
  
  -- Device Information
  device_type TEXT NOT NULL,
  device_brand TEXT,
  device_model TEXT,
  serial_number TEXT,
  accessories TEXT[],
  storage_location TEXT,
  device_color TEXT,
  device_password TEXT,
  year_of_purchase INTEGER,
  
  -- Service Information
  services TEXT[],
  tags TEXT,
  hardware_configuration TEXT,
  service_assessment TEXT,
  
  -- Additional Information
  details TEXT,
  attachments TEXT[],
  
  -- Status and Admin fields
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_device_type ON complaints(device_type);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);

-- Update trigger
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints" ON complaints
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own complaints" ON complaints
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Storage setup
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Disable RLS on storage temporarily for testing
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;