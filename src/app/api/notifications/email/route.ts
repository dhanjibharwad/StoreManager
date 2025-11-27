import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure email transporter
const createTransporter = async () => {
  const isGmail = process.env.EMAIL_USER?.includes('@gmail.com');
  
  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  } else {
    // Use Ethereal for testing if no valid email configured
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

export async function POST(request: Request) {
  try {
    const { email, name, type, otp } = await request.json();
    
    if (!email || !name || !type) {
      return NextResponse.json(
        { error: 'Email, name, and type are required' },
        { status: 400 }
      );
    }
    
    if (type === 'verification' && !otp) {
      return NextResponse.json(
        { error: 'OTP is required for verification emails' },
        { status: 400 }
      );
    }
    
    // Create transporter
    const emailTransporter = await createTransporter();
    
    console.log(`Attempting to send ${type} email to: ${email}`);
    console.log(`Using ${process.env.EMAIL_USER?.includes('@gmail.com') ? 'Gmail' : 'Ethereal test'} service`);
    let mailOptions;
    
    // Create email based on type
    if (type === 'verification') {
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Account - STORE MANAGER',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #22543d 0%, #22543d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">STORE MANAGER</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your Dream Is Just a Search Away</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${name},</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Welcome to STORE MANAGER! To complete your account setup and start exploring our comprehensive marketplace, please verify your email address using the code below:</p>
              <div style="background: #fef2f2; border: 2px dashed #22543d; padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0;">
                <p style="color: #22543d; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">VERIFICATION CODE</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              <p style="color: #666; font-size: 14px; margin-bottom: 20px;">⏰ This verification code expires in 30 minutes for your security.</p>
              <p style="color: #666; font-size: 14px;">If you didn't create an account with us, please disregard this email.</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #888; font-size: 12px; margin: 0;">© 2025 STORE MANAGER. This is an automated message.</p>
            </div>
          </div>
        `,
      };
    } else if (type === 'welcome') {
      mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to STORE MANAGER - Start Your Journey!',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #22543d 0%, #22543d 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🎉 Welcome to STORE MANAGER!</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your Dream Is Just a Search Away</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${name},</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Congratulations! Your account has been successfully verified. Welcome to STORE MANAGER - your comprehensive marketplace where you can find, rent, buy, sell, and discover events all in one place.</p>
              
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
                <h3 style="color: #22543d; margin: 0 0 20px 0; font-size: 20px; text-align: center;">🚀 Explore Our Services</h3>
                <div style="display: grid; gap: 15px;">
                  <div style="display: flex; align-items: center; padding: 10px 0;">
                    <span style="color: #22543d; font-size: 20px; margin-right: 15px;">🏠</span>
                    <div>
                      <strong style="color: #333; font-size: 15px;">Service 1:</strong>
                      <span style="color: #555; font-size: 15px;">Explore service 1</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; padding: 10px 0;">
                    <span style="color: #22543d; font-size: 20px; margin-right: 15px;">🔍</span>
                    <div>
                      <strong style="color: #333; font-size: 15px;">Service 2:</strong>
                      <span style="color: #555; font-size: 15px;">Explore service 2</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; padding: 10px 0;">
                    <span style="color: #22543d; font-size: 20px; margin-right: 15px;">🛒</span>
                    <div>
                      <strong style="color: #333; font-size: 15px;">Service 3:</strong>
                      <span style="color: #555; font-size: 15px;">Explore service 3</span>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; padding: 10px 0;">
                    <span style="color: #22543d; font-size: 20px; margin-right: 15px;">🎪</span>
                    <div>
                      <strong style="color: #333; font-size: 15px;">Service 4:</strong>
                      <span style="color: #555; font-size: 15px;">Explore service 4</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://STORE MANAGER.de" style="background: linear-gradient(135deg, #22543d 0%, #22543d 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Start Exploring Now</a>
              </div>
              
              <p style="color: #666; font-size: 14px; text-align: center;">Join thousands of users who find, rent, buy, sell, and create events on STORE MANAGER. Need help? Our support team is here for you.</p>
            </div>
            <div style="background: #f8f9fa; padding: 20px 30px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #22543d; font-size: 14px; margin: 0 0 5px 0; font-weight: 600;">Welcome to the Community! 🎉</p>
              <p style="color: #888; font-size: 12px; margin: 0;">© 2025 STORE MANAGER Team. This is an automated message.</p>
            </div>
          </div>
        `,
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      );
    }
    
    // Send email
    const result = await emailTransporter.sendMail(mailOptions);
    
    console.log(`${type} email sent successfully to ${email}`);
    if (!process.env.EMAIL_USER?.includes('@gmail.com')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 