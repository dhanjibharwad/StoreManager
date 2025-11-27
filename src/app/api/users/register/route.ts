/* eslint-disable */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      role,
      company_id
    } = body;

    // Generate temporary password - user must change on first login
    const tempPassword = Math.random().toString(36).slice(-8);

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create user with temporary password
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password: tempPassword,
        phone,
        role,
        company_id,
        is_email_verified: false // User must verify email first
      }])
      .select()
      .single();

    if (userError) throw userError;

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}