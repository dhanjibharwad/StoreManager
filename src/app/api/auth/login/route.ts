import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, generateOTP, generateSessionToken } from '@/lib/serverUtils';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get user with matching email and company info
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        companies(
          id,
          company_name
        )
      `)
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 400 }
      );
    }
    
    // Verify password
    const hashedPassword = hashPassword(password);
    if (hashedPassword !== user.password) {
      return NextResponse.json(
        { error: 'Invalid login credentials' },
        { status: 400 }
      );
    }
    
    // Check if email is verified
    if (!user.is_email_verified) {
      // Generate new OTP if not verified
      const emailOtp = generateOTP();
      
      await supabase
        .from('verification_codes')
        .upsert([
          {
            user_id: user.id,
            email: user.email,
            email_otp: emailOtp,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          }
        ]);
      
      // Return verification needed status and OTP
      return NextResponse.json({
        data: {
          user,
          needsVerification: true,
          needsEmailVerification: !user.is_email_verified,
          emailOtp
        }
      });
    }
    
    // Create session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: user.id,
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
    
    // Return user and session data
    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          is_email_verified: user.is_email_verified,
          is_phone_verified: user.is_phone_verified,
          role: user.role,
          company_id: user.company_id,
          company_name: user.companies?.company_name
        },
        session: {
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 