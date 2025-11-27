import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifySession } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    // Log the full request details for debugging
    console.log('Profile Update Request:', {
      headers: {
        authorization: request.headers.get('Authorization'),
        contentType: request.headers.get('Content-Type')
      },
      method: request.method
    });

    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the session
    const { data: sessionData, error: sessionError } = await verifySession(token);
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Get the request body
    const { name, phone } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        name, 
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionData.user.id)
      .select('id, name, email, phone, is_email_verified, is_phone_verified')
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error in profile update:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET method to fetch user profile
export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the session
    const { data: sessionData, error: sessionError } = await verifySession(token);
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: userProfile, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, phone, is_email_verified, is_phone_verified')
      .eq('id', sessionData.user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: userProfile
    });
  } catch (error) {
    console.error('Error in profile fetch:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 