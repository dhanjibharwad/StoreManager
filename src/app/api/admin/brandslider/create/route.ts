/* eslint-disable */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// Check if supabaseAdmin is available
if (!supabaseAdmin) {
  throw new Error('Supabase admin client is not available. Make sure SUPABASE_SERVICE_ROLE_KEY is set.');
}

export async function POST(request: Request) {
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
    if (!title || !imageBase64) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    // Upload image to Supabase Storage
    const imageData = imageBase64.split(',')[1]; // Remove the data:image/jpeg;base64, part
    const fileName = `brand_${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin!.storage
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
    const { data: publicUrlData } = supabaseAdmin!.storage
      .from('brandslider-images')
      .getPublicUrl(fileName);

    const image_url = publicUrlData.publicUrl;

    // Create new brand slider entry
    const { data: brandSlider, error: insertError } = await supabaseAdmin!
      .from('brand_slider')
      .insert([
        {
          user_id: data.user.id,
          title,
          description,
          image_url
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating brand slider:', insertError);
      return NextResponse.json({ error: 'Failed to create brand slider' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Brand slider created successfully',
      brandSlider 
    });
  } catch (error) {
    console.error('Error in brand slider creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 