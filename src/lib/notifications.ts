// Client-side API wrappers for sending notifications
// These functions call the server API endpoints instead of directly using nodemailer/twilio

// Send email verification OTP via API
export async function sendEmailOTP(email: string, otp: string, name: string) {
  try {
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        name,
        type: 'verification'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return { error };
  }
}

// Send SMS verification OTP via API
export async function sendSmsOTP(phone: string, otp: string) {
  try {
    const response = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        otp,
        type: 'verification'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to send SMS' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return { error };
  }
}

// Send welcome email after successful registration
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        type: 'welcome'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to send welcome email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { error };
  }
}

// Send welcome SMS after successful registration
export async function sendWelcomeSms(phone: string, name: string) {
  try {
    const response = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        name,
        type: 'welcome'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to send welcome SMS' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome SMS:', error);
    return { error };
  }
} 