import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { emailOrPhone, password, adminPassword } = await request.json();
    
    if (!emailOrPhone || !password || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find user by email or phone
    let query = supabase.from('users').select('*');
    
    if (emailOrPhone.includes('@')) {
      query = query.eq('email', emailOrPhone);
    } else {
      query = query.eq('phone', emailOrPhone);
    }
    
    const { data: userData, error: userError } = await query.single();
    
    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify user password (this is a simplified example, in production use proper password hashing)
    if (userData.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    const isAdmin = userData.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(userData.role);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You do not have admin privileges' },
        { status: 403 }
      );
    }
    
    // Verify admin credentials
    const tableName = `${userData.role}_credentials`;
    
    const { data: adminData, error: adminError } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userData.id)
      .single();
    
    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin credentials not set up. Please set up your admin credentials first.' },
        { status: 404 }
      );
    }
    
    // Check if the admin password matches using bcrypt
    const passwordMatches = await bcrypt.compare(adminPassword, adminData.admin_password);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      );
    }
    
    // Create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Create session
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: userData.id,
          token: sessionToken,
          expires_at: expiresAt.toISOString(),
        }
      ]);
    
    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    
    // Return user data and session token
    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role
      },
      session: {
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add DELETE method to handle admin logout
export async function DELETE(request: Request) {
  try {
    // Get admin token from the request
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Admin token is required' },
        { status: 400 }
      );
    }

    // Delete the admin session from the database
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error deleting admin session:', error);
      return NextResponse.json(
        { error: 'Failed to delete admin session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during admin logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Function to generate a session token
function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 