import { createHash, randomBytes } from 'crypto';

// Hash password using SHA-256 (server-side only)
export function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

// Generate a random OTP (server-side only)
export function generateOTP() {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a secure session token (server-side only)
export function generateSessionToken() {
  return randomBytes(64).toString('hex');
} 