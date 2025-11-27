/* eslint-disable */

'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { sendEmailOTP } from '@/lib/notifications';
import { hashPassword } from '@/lib/serverUtils';
import Image from 'next/image';

export default function ForgotPasswordPage() {
 
  
  // Step states
  const [step, setStep] = useState(1);
  
  // Form data
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for tracking verification info
  const [userId, setUserId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [userName, setUserName] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [verifiedOtp, setVerifiedOtp] = useState('');



  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to request password reset');
        return;
      }
      
      // Store verification info
      setUserId(result.data.userId);
      setContactInfo(result.data.contactInfo);
      setUserName(result.data.name);
      
      // Send OTP via email
      await sendEmailOTP(result.data.contactInfo, result.data.otp, result.data.name);
      
      setOtpSent(true);
      setStep(2);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Request reset error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpInput.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Make an API call to verify the OTP without updating the password yet
      const response = await fetch('/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          otp: otpInput
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        setError(result.error || 'Invalid verification code');
        return;
      }
      
      // Store the verified OTP to use in the final step
      setVerifiedOtp(otpInput);
      setStep(3);
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          otp: verifiedOtp,
          newPassword: hashPassword(newPassword)
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to reset password');
        return;
      }
      
      // Success - move to completion step
      setStep(4);
    } catch (err) {
      setError('An unexpected error occurred while resetting your password.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!userId || !contactInfo) return;
    
    setResendDisabled(true);
    let timer = 30;
    setCountdown(timer);
    
    const countdownInterval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(countdownInterval);
        setResendDisabled(false);
      }
    }, 1000);
    
    try {
      // Request a new OTP
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to resend verification code');
        return;
      }
      
      // Send the new OTP via email
      await sendEmailOTP(contactInfo, result.data.otp, userName);
      
      // Show success message without alert popup
      setError(null);
    } catch (err) {
      setError('Failed to resend verification code');
      console.error('Resend OTP error:', err);
    }
  };
  
  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8 sm:pb-12 flex flex-col items-center justify-center">
      {/* mt-25 */}
      <div className="bg-white/80 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl border border-white/20 w-full max-w-md">
        {/* Step 1: Enter Email or Phone */}
        {step === 1 && (
          <>
            {/* Logo Section */}
            <div className="text-center mb-8">
             <div className="mb-2 top-4 left-4 flex items-center justify-center">
                       <Image
                         src="/images/nlg3.png" // Your logo in /public/images/
                         alt="Store Logo"
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
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <form onSubmit={handleRequestReset} className="space-y-6">
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${
                    loading ? 'opacity-70 cursor-not-allowed transform-none' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/user/auth/login" className="font-semibold text-gray-600 hover:text-gray-500 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
        
        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <>
            {/* Logo Section */}
            <div className="text-center mb-8">
              {/* <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div> */}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
              <p className="text-gray-600 text-sm">
                We've sent a verification code to your email ({contactInfo})
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            {!error && resendDisabled && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                A new verification code has been sent to your email
              </div>
            )}
            
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otpInput" className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otpInput"
                  type="text"
                  value={otpInput}
                  onChange={(e) => {
                    // Only allow digits and limit to 6 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpInput(value);
                  }}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
                  placeholder="Enter 6-digit code"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="order-2 sm:order-1 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading || otpInput.length !== 6}
                  className={`order-1 sm:order-2 flex-1 flex justify-center items-center cursor-pointer py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition-colors ${
                    loading || otpInput.length !== 6 ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                  className={`font-semibold text-gray-900 hover:text-gray-500 transition-colors ${
                    resendDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
              </p>
            </div>
          </>
        )}
        
        {/* Step 3: Reset Password */}
        {step === 3 && (
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h1>
              <p className="text-gray-600 text-sm">Choose a secure password for your account</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showNewPassword ? (
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
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 pr-12"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
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
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="order-2 sm:order-1 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`order-1 sm:order-2 flex-1 flex justify-center items-center cursor-pointer py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition-colors ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
        
        {/* Step 4: Success */}
        {step === 4 && (
          <>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Password Reset Successful</h1>
              <p className="text-gray-600 mb-8">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link 
                href="/user/auth/login"
                className="inline-flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition-all duration-200 hover:scale-[1.02]"
              >
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 