-- Fix storage policies for file uploads
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to files" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');