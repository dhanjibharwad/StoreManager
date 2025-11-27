/* eslint-disable */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { sendEmailOTP } from '@/lib/notifications';
import { useAuth, saveAuthData } from '@/lib/authContext';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/user/home');
    }
  }, [isAuthenticated, router]);

  // State for form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for verification
  const [showVerification, setShowVerification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);




  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setError(typeof error === 'string' ? error : 'Login failed');
        return;
      }

      if (data?.needsVerification) {
        // User needs to verify email
        setUserId(data.user.id);
        setUserData(data.user);
        setNeedsEmailVerification(data.needsEmailVerification);

        // OTP is generated and sent from the server
        if (data.needsEmailVerification) {
          await sendEmailOTP(data.user.email, 'placeholder', data.user.name);
        }

        setShowVerification(true);
      } else {
        // User is fully verified, set auth data immediately
        saveAuthData(data.session.token);
        setToken(data.session.token);
        setUser(data.user);

        // Redirect to home page
        router.push('/user/home');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification
  const handleEmailVerification = async () => {
    if (!userId) return;

    setVerificationLoading(true);
    setVerificationError(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          otp: emailOtpInput
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setVerificationError(result.error || 'Email verification failed');
        return;
      }

      if (result.data?.fullyVerified) {
        // Email verified, login complete - save auth data first
        saveAuthData(result.data.session.token);
        setToken(result.data.session.token);
        setUser(result.data.user);
        router.push('/user/home');
      } else {
        // Email verified, login complete
        setEmailOtpInput('');
        setEmailVerified(true);
        // Redirect to home page after email verification
        router.push('/user/home');
      }
    } catch (err) {
      setVerificationError('An error occurred during email verification');
      console.error('Email verification error:', err);
    } finally {
      setVerificationLoading(false);
    }
  };



  // Resend email OTP
  const handleResendEmailOTP = async () => {
    if (!userId || !userData) return;

    try {
      // First, get a new OTP from the server
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          email: userData.email,
          name: userData.name
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setVerificationError(result.error || 'Failed to resend verification code');
        return;
      }

      // Then send the email with the new OTP
      await sendEmailOTP(userData.email, result.otp, userData.name);

      alert('Verification code has been resent to your email');
    } catch (err) {
      setVerificationError('Failed to resend verification code');
      console.error('Resend email OTP error:', err);
    }
  };



  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8 sm:pb-12 flex flex-col items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl border border-white/20 w-full max-w-md">
        {!showVerification ? (
          <>
            {/* Logo Section */}
            <div className="text-center mb-8">

              <div className="mb-2 top-4 left-4 flex items-center justify-center">
                <Image
                  src="/images/nlg3.png" // Your logo in /public/images/
                  alt="Union Enterprise Logo"
                  width={70}   // bigger for clarity
                  height={70}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-sm">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-red-700 rounded-xl text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/user/auth/forgot-password" className="font-semibold text-gray-600 hover:text-gray-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center cursor-pointer py-3 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/user/auth/register" className="font-semibold text-gray-600 hover:text-gray-500 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </>
        ) : (
          // Verification Form
          <>
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
              <p className="text-gray-600 text-sm">Complete verification to secure your account</p>
            </div>

            {verificationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {verificationError}
              </div>
            )}

            <div className="space-y-6">
              {/* Email verification */}
              {needsEmailVerification && !emailVerified && (
                <div className="p-6 border border-gray-200 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a verification code to your email address.
                  </p>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
                      placeholder="Enter verification code"
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleEmailVerification}
                        disabled={verificationLoading || !emailOtpInput}
                        className={`flex-1 px-4 py-3 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg transition-all duration-200 ${verificationLoading || !emailOtpInput ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                          }`}
                      >
                        Verify Email
                      </button>

                      <button
                        onClick={handleResendEmailOTP}
                        className="px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {needsEmailVerification && emailVerified && (
                <div className="p-6 border border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50">
                  <div className="flex items-center text-green-700">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-semibold">Email verified successfully! Redirecting...</span>
                  </div>
                </div>
              )}

              {/* Information about next steps */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Almost Done!</h4>
                    <p className="text-sm text-amber-700">
                      Email verification is required to complete your login.
                      After verification, you'll be automatically redirected to your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 