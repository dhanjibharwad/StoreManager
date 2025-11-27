# Complaint System Setup

This document explains how to set up the improved complaint system with file upload functionality.

## Database Setup

1. **Create the complaints table** by running the SQL script in your Supabase SQL editor:
   ```sql
   -- Execute the src/lib/complaints-schema.sql file
   ```

2. **Create storage bucket** for file uploads:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
   ```

3. **Set up storage policies** (run in Supabase SQL editor):
   ```sql
   -- Allow authenticated users to upload files
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

   -- Allow public access to view files
   CREATE POLICY "Allow public access" ON storage.objects
     FOR SELECT USING (bucket_id = 'uploads');

   -- Allow users to delete their own files
   CREATE POLICY "Allow users to delete own files" ON storage.objects
     FOR DELETE USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Features Added

### 1. **Auto-fetch Email from Auth**
- The email field is automatically populated from the logged-in user's account
- The field is read-only to prevent tampering

### 2. **Phone Number Field**
- Added a required phone number field for better contact information

### 3. **File Upload System**
- Support for images and videos
- Maximum 5 files per complaint
- 10MB size limit per file
- Drag-and-drop functionality
- File preview with thumbnails
- Files are stored in Supabase Storage

### 4. **Enhanced UI/UX**
- Better form layout and styling
- File upload with drag-and-drop
- Progress indicators during upload
- Success/error message styling
- Form validation and error handling

## File Upload Process

1. **File Selection**: Users can select files via file input or drag-and-drop
2. **Validation**: Files are validated for type (images/videos) and size (max 10MB)
3. **Upload**: Files are uploaded to Supabase Storage in the `uploads/complaints/` folder
4. **Storage**: File URLs are stored in the complaints table as an array

## Database Schema

The complaints table includes:
- `id`: UUID primary key
- `user_id`: Reference to the user who submitted the complaint
- `email`: User's email address
- `phone`: User's phone number
- `address`: User's address
- `device_name`: Name of the device with issues
- `model_number`: Model number of the device
- `year_of_purchase`: Year the device was purchased
- `details`: Detailed description of the issue
- `attachments`: Array of file URLs
- `status`: Complaint status (pending, in_progress, resolved, closed)
- `admin_notes`: Notes from administrators
- `created_at`: Timestamp when complaint was created
- `updated_at`: Timestamp when complaint was last updated

## Security Features

- **Row Level Security (RLS)**: Users can only view and modify their own complaints
- **File Upload Security**: Only authenticated users can upload files
- **File Type Validation**: Only images and videos are allowed
- **File Size Limits**: Maximum 10MB per file to prevent abuse

## Usage

1. User logs in to their account
2. Navigates to the complaint form
3. Email is auto-populated from their account
4. User fills in required fields (phone, address, device details)
5. User can optionally upload images/videos of the issue
6. Form is submitted and stored in the database
7. Files are uploaded to Supabase Storage
8. User receives confirmation of successful submission

## Admin Features (Future Enhancement)

The system is prepared for admin features:
- View all complaints
- Update complaint status
- Add admin notes
- Filter complaints by status
- Download attachments

## Troubleshooting

### Common Issues:

1. **File upload fails**: Check if the `uploads` bucket exists and has proper policies
2. **Email not auto-populated**: Ensure user is properly authenticated
3. **Database errors**: Verify the complaints table schema is created correctly
4. **Storage errors**: Check Supabase storage configuration and policies

### Required Environment Variables:

Make sure your `.env.local` file includes:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```