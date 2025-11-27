-- Simple fix for storage uploads
-- Run this in Supabase SQL Editor

-- Make uploads bucket public
UPDATE storage.buckets SET public = true WHERE id = 'uploads';

-- Create simple policy for authenticated users
CREATE POLICY "Allow all for authenticated users" ON storage.objects
FOR ALL USING (bucket_id = 'uploads');