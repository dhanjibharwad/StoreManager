import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, generateOTP, generateSessionToken } from '@/lib/serverUtils';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, verified, company_id, role, invite_token } = await request.json();
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    

    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // If this is a verified registration (after OTP verification)
    if (verified) {
      // Hash the password
      const hashedPassword = hashPassword(password);
      
      // Check for pending invitation - prioritize invite_token if provided
      let invitation = null;
      if (invite_token) {
        const { data: tokenInvitation } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('invite_token', invite_token)
          .eq('status', 'pending')
          .single();
        invitation = tokenInvitation;
      } else {
        const { data: emailInvitation } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('email', email)
          .eq('status', 'pending')
          .single();
        invitation = emailInvitation;
      }

      // Create user in custom users table with verified status
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            name, 
            email, 
            phone: phone || null, 
            password: hashedPassword,
            is_email_verified: true,
            is_phone_verified: phone ? true : false,
            company_id: company_id || invitation?.company_id || null,
            role: role || invitation?.role || 'user'
          }
        ])
        .select()
        .single();

      // If there was an invitation, mark it as accepted
      if (invitation) {
        await supabase
          .from('user_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation.id);
      }
      
      if (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
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
            user_id: data.id,
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
      
      // Return user data and session
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        is_email_verified: data.is_email_verified,
        role: data.role
      };
      
      return NextResponse.json({
        success: true,
        data: {
          user: userData,
          session: {
            token: sessionToken,
            expires_at: expiresAt.toISOString()
          }
        }
      });
    } 
    // For unverified registrations, we don't store anything in the database
    // Instead, we just check if the email is available and return success
    else {
      // Generate OTP for email verification
      const emailOtp = generateOTP();
      
      return NextResponse.json({
        success: true,
        data: {
          email_available: true
        },
        emailOtp
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
} 