import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message, phone } = await req.json();

    if (!name || !email || !message || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('Email credentials not configured.');
      return NextResponse.json({
        success: true,
        message: 'Message received, but email not sent due to missing configuration'
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.de',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const emailText = `
      New Contact Form Submission
      --------------------------
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Subject: ${subject || 'No subject provided'}
      Message: ${message}
    `;

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Contact Form: ${subject} - New Contact Form Submission`,
      text: emailText,
      html: `
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #e91111ff 0%, #c41e3a 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Ainops</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">New Contact Submission</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin: 0 0 24px 0; font-size: 24px; font-weight: 600; border-bottom: 3px solid #e91111ff; display: inline-block; padding-bottom: 8px;">Contact Details</h2>
            </div>

            <!-- Contact Information Grid -->
            <div style="margin-bottom: 30px;">
                <div style="display: grid; gap: 20px;">
                    
                    <div style="display: flex; align-items: flex-start; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #e91111ff;">
                        
                        <div>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</p>
                            <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${name}</p>
                        </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #e91111ff;">
                        
                        <div>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</p>
                            <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${email}</p>
                        </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #e91111ff;">
                        
                        <div>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</p>
                            <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${phone}</p>
                        </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #e91111ff;">
                      
                        <div>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                            <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 600;">${subject || 'No subject provided'}</p>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Message Section -->
            <div style="margin-bottom: 30px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                   
                    <h3 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Message</h3>
                </div>
                <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; position: relative;">
                    <div style="position: absolute; top: -1px; left: 24px; width: 40px; height: 3px; background-color: #e91111ff; border-radius: 0 0 3px 3px;"></div>
                    <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
            </div>

            <!-- Action Note -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                    <strong>⚡ Action Required:</strong> This is a new contact form submission that requires your attention. Please respond within 2 - 4 hours for optimal customer experience.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Received on <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>
            </p>
            <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                © 2025 Ainops. All rights reserved.
            </p>
        </div>
    </div>
      `
    };

    const userConfirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thanks for reaching out to Ainops`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
            <div style="background: linear-gradient(135deg, #e91111ff 0%, #c41e3a 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Ainops</h1>
            </div>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
             We've received your message and our team will get back to you as soon as possible.
          </p>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; color: #111827; margin-bottom: 8px;"><strong>Your Submission Details:</strong></p>
            <ul style="list-style-type: none; padding: 0; font-size: 15px; color: #374151; line-height: 1.5;">
              <li><strong>Subject:</strong> ${subject || 'No subject provided'}</li>
              <li><strong>Phone:</strong> ${phone}</li>
              <li><strong>Message:</strong> ${message}</li>
            </ul>
          </div>
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            We typically respond within <strong>2 – 4 business hours</strong>. Until then, feel free to explore more at <a href="https://ainops.de" style="color: #e91111ff; text-decoration: none;">ainops.de</a>.
          </p>
          <p style="font-size: 16px; color: #374151; margin-top: 24px;">
            Warm regards,<br />
            <strong>The Ainops Team</strong>
          </p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userConfirmationMailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process your request',
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}