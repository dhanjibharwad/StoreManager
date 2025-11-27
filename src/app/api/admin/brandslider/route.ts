/* eslint-disable */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
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

    // Check if user has admin role
    const isAdmin = data.user.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(data.user.role);

    if (!isAdmin) {
      return NextResponse.json({ error: 'User is not an admin' }, { status: 403 });
    }

    // Fetch all brand slider entries with user information
    const { data: brandSliders, error: fetchError } = await supabaseAdmin
      .from('brand_slider')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching brand sliders:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch brand sliders' }, { status: 500 });
    }

    return NextResponse.json({ brandSliders });
  } catch (error) {
    console.error('Error in brand slider API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 