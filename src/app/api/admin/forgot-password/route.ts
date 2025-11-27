/* eslint-disable */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import { otpStore, generateOTP, cleanupExpiredOTPs } from '@/lib/otpStore';

// Create a transporter using IONOS SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.de',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {               // uday changes
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Clean up expired OTPs
    cleanupExpiredOTPs();

    // Check if user exists and is an admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is an admin
    const isAdmin = userData.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(userData.role);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admin users can use this feature.' },
        { status: 403 }
      );
    }

    // Generate OTP and store it with 30 minutes expiry
    const otp = generateOTP();
    const expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now
    otpStore.set(email, {
      otp,
      expiry: expiryTime,
      userId: userData.id,
      role: userData.role
    });

    try {
      // Send email with OTP
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: 'Admin Password Reset OTP',
        text: `Hello ${userData.name},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP will expire in 30 minutes.\n\nBest regards,\nAdmin Team`,
        html: `
          <h2>Admin Password Reset OTP</h2>
          <p>Hello ${userData.name},</p>
          <p>Your OTP for password reset is: <strong>${otp}</strong></p>
          <p>This OTP will expire in 30 minutes.</p>
          <br>
          <p>Best regards,<br>Admin Team</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'An OTP has been sent to your email'
    });

  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 