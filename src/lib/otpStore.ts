// In-memory store for OTPs with expiry (30 minutes)
export const otpStore = new Map<string, { otp: string; expiry: number; userId: string; role: string }>();

// Function to generate a 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to clean up expired OTPs
export function cleanupExpiredOTPs() {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiry < now) {
      otpStore.delete(email);
    }
  }
} 