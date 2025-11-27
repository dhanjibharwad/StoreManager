-- Fix storage policies for your custom auth system

-- First, disable RLS on storage.objects temporarily
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create the uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Make sure the bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'uploads';

-- Optional: Enable RLS with custom policies later
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on uploads bucket" ON storage.objects
--   FOR ALL USING (bucket_id = 'uploads');