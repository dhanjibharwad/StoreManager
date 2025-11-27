-- Fix storage policies for file uploads
-- Run these commands in Supabase SQL Editor

-- Create storage policies for uploads bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');