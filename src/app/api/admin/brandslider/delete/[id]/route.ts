/* eslint-disable */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Await the params since it's now a Promise
  const params = await context.params;
  const id = params.id;
  
  try {
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not available');
    }
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No authentication token found' }, { status: 401 });
    }

    // Verify the session and get user data
    const { data, error } = await verifySession(token);

    if (error || !data?.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check if user has admin roles
    const isAdmin = data.user.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(data.user.role);

    if (!isAdmin) {
      return NextResponse.json({ error: 'User is not an admin' }, { status: 403 });
    }

    // First, get the brand slider entry to find the image URL
    const { data: brandSlider, error: fetchError } = await supabaseAdmin
      .from('brand_slider')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching brand slider:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch brand slider' }, { status: 500 });
    }

    if (!brandSlider) {
      return NextResponse.json({ error: 'Brand slider not found' }, { status: 404 });
    }

    // Extract the file name from the image URL
    const imageUrl = brandSlider.image_url;
    
    // The URL format from Supabase is typically like:
    // https://[project-ref].supabase.co/storage/v1/object/public/brandslider-images/brand_1234567890.jpg
    // We need to extract just the filename part (brand_1234567890.jpg)
    
    try {
      // Parse the URL to extract just the filename
      const urlObj = new URL(imageUrl);
      const pathSegments = urlObj.pathname.split('/');
      const fileName = pathSegments[pathSegments.length - 1];
      
      console.log('Attempting to delete image:', fileName);
      
      // Delete the image from storage if we have a valid filename
      if (fileName && fileName.length > 0) {
        const { data: deleteData, error: deleteImageError } = await supabaseAdmin.storage
          .from('brandslider-images')
          .remove([fileName]);

        if (deleteImageError) {
          console.error('Error deleting image:', deleteImageError);
          // Continue with deletion of database record even if image deletion fails
        } else {
          console.log('Image deleted successfully:', fileName);
        }
      }
    } catch (err) {
      console.error('Error parsing image URL or deleting image:', err);
      // Continue with deletion of database record even if image deletion fails
    }

    // Delete the brand slider entry
    const { error: deleteError } = await supabaseAdmin
      .from('brand_slider')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting brand slider:', deleteError);
      return NextResponse.json({ error: 'Failed to delete brand slider' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Brand slider deleted successfully'
    });
  } catch (error) {
    console.error('Error in brand slider delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}