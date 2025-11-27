/* eslint-disable */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    console.log('API called');
    
    // Test environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }
    
    const body = await request.json();
    console.log('Body parsed successfully');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const {
      company_name,
      email,
      phone,
      website,
      gst_number,
      industry,
      company_size,
      address,
      city,
      state,
      country,
      postal_code,
      admin_name,
      admin_email,
      subscription_plan
    } = body;

    // Insert company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{
        company_name,
        email,
        phone,
        website,
        gst_number,
        industry,
        company_size,
        address,
        city,
        state,
        country,
        postal_code,
        subscription_plan,
        admin_name,
        admin_email
      }])
      .select()
      .single();

    if (companyError) {
      console.error('Company error:', companyError);
      throw new Error(`Company insert failed: ${companyError.message}`);
    }

    // Store admin details in company record for later user creation
    // User will be created when they complete registration via email link

    // Send registration email directly
    try {
      const emailPassword = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;
      
      console.log(`Sending registration email to admin: ${admin_email}`);
      
      if (process.env.EMAIL_USER && emailPassword) {
        const isGmail = process.env.EMAIL_USER?.includes('@gmail.com');
        
        let transporter;
        if (isGmail) {
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: emailPassword,
            },
          });
        } else {
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
        
        const mailOptions = {
          from: process.env.EMAIL_USER || 'test@ethereal.email',
          to: admin_email,
          subject: 'Welcome to Store Manager - Complete Your Registration',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #0ea5e9; text-align: center; margin-bottom: 30px;">Welcome to Store Manager!</h1>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${admin_name},</p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Thank you for registering <strong>${company_name}</strong> with Store Manager!
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8002'}/user/auth/register?email=${encodeURIComponent(admin_email)}&company_id=${company.id}&role=admin" 
                     style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Complete Registration
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  Company: ${company_name} | Plan: ${subscription_plan}
                </p>
              </div>
            </div>
          `
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Registration email sent successfully to:', admin_email);
        
        if (!isGmail) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
        }
      } else {
        console.log('Email credentials not configured - skipping email');
      }
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Company registered successfully. Please check your email to complete the setup.',
      company_id: company.id
    });


  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}