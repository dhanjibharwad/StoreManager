/* eslint-disable */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const body = await request.json();
    const { name, email, phone, role, company_id } = body;
    
    // Validate required fields
    if (!name || !email || !role || !company_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists or has pending invitation
    const [userCheck, inviteCheck] = await Promise.all([
      supabase.from('users').select('id').eq('email', email).single(),
      supabase.from('user_invitations').select('id').eq('email', email).eq('status', 'pending').single()
    ]);

    if (userCheck.data) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    if (inviteCheck.data) {
      return NextResponse.json(
        { success: false, message: 'Invitation already sent to this email' },
        { status: 400 }
      );
    }

    // Generate secure invitation token
    const inviteToken = crypto.randomUUID().replace(/-/g, '');

    const { error: inviteError } = await supabase
      .from('user_invitations')
      .insert([{
        name,
        email,
        phone,
        role,
        company_id,
        invite_token: inviteToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }]);

    if (inviteError) {
      console.error('Invitation insert error:', inviteError);
      throw inviteError;
    }

    // Get company name for email
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('id', company_id)
      .single();

    // Try to send invitation email (optional)
    let emailSent = false;
    console.log('Email config check:', {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_APP_PASSWORD,
      emailUser: process.env.EMAIL_USER
    });
    
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
        console.log('Creating email transporter...');
        const isGmail = process.env.EMAIL_USER?.includes('@gmail.com');
        
        let transporter;
        if (isGmail) {
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_APP_PASSWORD,
            },
          });
        } else {
          // Use Ethereal for testing if no valid email configured
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
        }

        const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8002'}/user/accept-invite?token=${encodeURIComponent(inviteToken)}`;
        
        // Sanitize user inputs for HTML
        const sanitizedName = name.replace(/[<>"'&]/g, '');
        const sanitizedCompanyName = (company?.company_name || 'Company').replace(/[<>"'&]/g, '');
        const sanitizedRole = role.replace(/[<>"'&]/g, '');

        console.log('Sending email to:', email);
        console.log(`Using ${isGmail ? 'Gmail' : 'Ethereal test'} service`);
        
        const result = await transporter.sendMail({
          from: process.env.EMAIL_USER || 'test@ethereal.email',
          to: email,
          subject: `Invitation to join ${sanitizedCompanyName}`,
          html: `
            <h2>You're invited to join ${sanitizedCompanyName}!</h2>
            <p>Hi ${sanitizedName},</p>
            <p>You've been invited to join as a <strong>${sanitizedRole}</strong>.</p>
            <p>Click the link below to create your account:</p>
            <a href="${inviteUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Accept Invitation
            </a>
            <p>Or copy this link: ${inviteUrl}</p>
            <p>This invitation expires in 7 days.</p>
          `,
        });
        
        console.log('Email sent successfully:', result.messageId);
        if (!isGmail) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
        }
        emailSent = true;
      } else {
        console.log('Email credentials not configured');
      }
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the entire request if email fails
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/user/accept-invite?token=${encodeURIComponent(inviteToken)}`;
    
    return NextResponse.json({ 
      success: true, 
      message: emailSent ? 'Invitation sent successfully' : 'Invitation created - Use the link below',
      invite_token: inviteToken,
      invite_url: inviteUrl, // Direct link for testing
      debug: {
        emailSent,
        hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD),
        emailUser: process.env.EMAIL_USER,
        targetEmail: email
      }
    });

  } catch (error: any) {
    console.error('Invite API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}