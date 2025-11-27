/* eslint-disable */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Check if supabaseAdmin is available
if (!supabaseAdmin) {
  throw new Error('Supabase admin client is not available. Make sure SUPABASE_SERVICE_ROLE_KEY is set.');
}

export async function PUT(
  request: Request, 
  context: { params: Promise<{ id: string }> }
) {
  // Await the params since it's now a Promise
  const params = await context.params;
  const id = params.id;
  
  try {
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

    // Check if user has admin role
    const isAdmin = data.user.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(data.user.role);

    if (!isAdmin) {
      return NextResponse.json({ error: 'User is not an admin' }, { status: 403 });
    }

    // Parse request body
    const { title, description, imageBase64 } = await request.json();

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      title,
      description,
      updated_at: new Date().toISOString()
    };

    // If a new image is provided, upload it and delete the old one
    if (imageBase64 && imageBase64.startsWith('data:')) {
      // First, get the current brand slider to find the old image URL
      const { data: currentBrandSlider, error: fetchError } = await supabaseAdmin!
        .from('brand_slider')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching current brand slider:', fetchError);
        // Continue with update even if we can't fetch the current image
      } else if (currentBrandSlider?.image_url) {
        // Try to delete the old image
        try {
          // Parse the URL to extract just the filename
          const oldImageUrl = currentBrandSlider.image_url;
          const urlObj = new URL(oldImageUrl);
          const pathSegments = urlObj.pathname.split('/');
          const oldFileName = pathSegments[pathSegments.length - 1];
          
          console.log('Attempting to delete old image:', oldFileName);
          
          if (oldFileName && oldFileName.length > 0) {
            const { error: deleteImageError } = await supabaseAdmin!.storage
              .from('brandslider-images')
              .remove([oldFileName]);
            
            if (deleteImageError) {
              console.error('Error deleting old image:', deleteImageError);
            } else {
              console.log('Old image deleted successfully:', oldFileName);
            }
          }
        } catch (err) {
          console.error('Error parsing old image URL or deleting old image:', err);
        }
      }
      
      // Upload new image to Supabase Storage
      const imageData = imageBase64.split(',')[1];
      const fileName = `brand_${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin!
        .storage
        .from('brandslider-images')
        .upload(fileName, Buffer.from(imageData, 'base64'), {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }

      // Get public URL for the uploaded image
      const { data: publicUrlData } = supabaseAdmin!
        .storage
        .from('brandslider-images')
        .getPublicUrl(fileName);

      updateData.image_url = publicUrlData.publicUrl;
    }

    // Update the brand slider entry
    const { data: updatedBrandSlider, error: updateError } = await supabaseAdmin!
      .from('brand_slider')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating brand slider:', updateError);
      return NextResponse.json({ error: 'Failed to update brand slider' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Brand slider updated successfully',
      brandSlider: updatedBrandSlider
    });
  } catch (error) {
    console.error('Error in brand slider update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}