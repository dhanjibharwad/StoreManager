import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  let to, subject, html;
  
  try {
    const body = await request.json();
    to = body.to;
    subject = body.subject;
    html = body.html;

    // Check if email credentials are available
    const emailPassword = process.env.EMAIL_PASS || process.env.EMAIL_APP_PASSWORD;
    
    if (!process.env.EMAIL_USER || !emailPassword) {
      console.log('\n=== EMAIL WOULD BE SENT ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Note: Configure EMAIL_USER and EMAIL_PASS/EMAIL_APP_PASSWORD to send actual emails');
      console.log('========================\n');
      return NextResponse.json({ success: true });
    }

    // Configure SMTP
    let transporter;
    const isGmail = process.env.EMAIL_USER?.includes('@gmail.com');
    
    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: emailPassword
        }
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
          pass: testAccount.pass
        }
      });
      console.log('Using Ethereal test email service');
    }

    console.log(`Attempting to send email to: ${to}`);
    console.log(`Using ${isGmail ? 'Gmail' : 'Ethereal test'} service with user: ${process.env.EMAIL_USER || 'test'}`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'test@ethereal.email',
      to,
      subject,
      html
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${to}`);
    if (!isGmail) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
    }
    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Email error:', error);
    console.log('\n=== EMAIL FAILED TO SEND ===');
    console.log('Intended recipient:', to || 'Unknown');
    console.log('Subject:', subject || 'Unknown');
    console.log('==========================\n');
    return NextResponse.json({ success: false }, { status: 500 });
  }
}