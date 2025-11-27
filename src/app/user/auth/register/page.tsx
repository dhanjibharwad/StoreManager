/* eslint-disable */


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, checkUserExists } from '@/lib/auth';
import { sendEmailOTP, sendWelcomeEmail } from '@/lib/notifications';
import { useAuth, saveAuthData } from '@/lib/authContext';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setToken, isAuthenticated } = useAuth();

  // Handle URL parameters and redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/user/home');
      return;
    }
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const companyIdParam = urlParams.get('company_id');
    const roleParam = urlParams.get('role');
    const inviteTokenParam = urlParams.get('invite_token');
    
    if (emailParam) {
      setEmail(emailParam);
    }
    if (companyIdParam) {
      setCompanyId(companyIdParam);
    }
    if (roleParam) {
      setUserRole(roleParam);
    }
    if (inviteTokenParam) {
      setInviteToken(inviteTokenParam);
    }
  }, [isAuthenticated, router]);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Company registration parameters
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1: basic info, 2: email verification

  // Verification state
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Temporary registration data (stored in memory, not in database)
  const [registrationData, setRegistrationData] = useState<{
    name: string;
    email: string;
    password: string;
    emailOtp?: string;
  } | null>(null);

  // Resend cooldown states
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);

  // Setup cooldown timers
  useEffect(() => {
    let emailTimer: NodeJS.Timeout | null = null;

    if (emailResendCooldown > 0) {
      emailTimer = setInterval(() => {
        setEmailResendCooldown(prev => prev - 1);
      }, 1000);
    }

    return () => {
      if (emailTimer) clearInterval(emailTimer);
    };
  }, [emailResendCooldown]);






  // Handle OTP input to limit to 6 digits
  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>, setOtp: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only allow digits and limit to 6
    setOtp(value);
  };



  // Handle step 1 form submission (basic info)
  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate terms acceptance
    if (!acceptTerms) {
      setError('You must accept the Terms & Conditions and Privacy Policy to continue');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Min password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user with this email already exists
      const { exists, existingField } = await checkUserExists(email, null);

      if (exists) {
        setError('An account with this email address already exists');
        setLoading(false);
        return;
      }

      // Generate temporary user ID for tracking the verification process
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      setTempUserId(tempId);

      // Generate OTPs on client side (in a real app, this would be done server-side)
      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store registration data in memory (not in database yet)
      setRegistrationData({
        name,
        email,
        password,
        emailOtp
      });

      // Send verification code to email
      await sendEmailOTP(email, emailOtp, name);
      setEmailOtpSent(true);

      // Move to email verification step
      setCurrentStep(2);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification
  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationData || !emailOtpInput) return;

    setVerificationLoading(true);
    setVerificationError(null);

    try {
      // Verify email OTP (client-side verification for now)
      if (emailOtpInput !== registrationData.emailOtp) {
        setVerificationError('Invalid verification code');
        setVerificationLoading(false);
        return;
      }

      setEmailVerified(true);

      // Check again if user with this email already exists
      // This is a double-check in case someone registered with the same details while this user was verifying
      const { exists, existingField } = await checkUserExists(registrationData.email, null);

      if (exists) {
        setVerificationError('An account with this email address already exists');
        return;
      }

      // Now that email is verified, create the user in the database
      const { name, email, password } = registrationData;

      // Create user in database with company info if available
      // Pass invite token to ensure proper role assignment
      const { data, error } = await signUp(name, email, null, password, companyId, userRole, inviteToken);

      if (error) {
        setVerificationError(error.message);
        return;
      }

      if (data && data.session) {
        // Set auth data
        setUser(data.user);
        setToken(data.session.token);
        saveAuthData(data.session.token);

        // Send welcome email
        try {
          await sendWelcomeEmail(email, name);
        } catch (err) {
          console.error('Error sending welcome email:', err);
          // Continue with redirect even if welcome email fails
        }

        // Redirect to home page
        router.push('/user/home');
      }
    } catch (err) {
      setVerificationError('An error occurred during email verification');
      console.error('Email verification error:', err);
    } finally {
      setVerificationLoading(false);
    }
  };



  // Handle email OTP resend
  const handleResendEmailOTP = async () => {
    if (!registrationData || emailResendCooldown > 0) return;

    try {
      // Generate a new OTP
      const newEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Update registration data with new OTP
      setRegistrationData({
        ...registrationData,
        emailOtp: newEmailOtp
      });

      // Send the new OTP via email
      await sendEmailOTP(registrationData.email, newEmailOtp, registrationData.name);

      // Set cooldown for 30 seconds
      setEmailResendCooldown(30);

      // Show success message
      setVerificationError(null);
    } catch (err) {
      setVerificationError('Failed to resend verification code. Please try again.');
      console.error('Error resending email OTP:', err);
    }
  };



  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="mb-2 top-2 left-4 flex items-center justify-center">
          <Image
            src="/images/nlg3.png" // Your logo in /public/images/
            alt="Union Enterprise Logo"
            width={60}   // bigger for clarity
            height={60}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create Your Account</h1>
    
      </div>
    );
  };

  // Render error message with login link
  const renderErrorWithLoginLink = (message: string) => (
    <div className="mb-4 p-3 bg-gray-100 border border-gray-400 text-gray-700 rounded">
      {message}
      <div className="mt-2">
        <Link href="/user/auth/login" className="font-medium text-gray-600 hover:text-gray-500">
          Go to login page
        </Link>
      </div>
    </div>
  );

  // Step 1: Basic Information
  const renderStep1 = () => {
    return (
      <>
        {error && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200"
              placeholder="Enter your full name"
            />
          </div>

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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 pr-12"
                placeholder="Create a password"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 pr-12"
                placeholder="Confirm your password"
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

          <div className="flex items-start space-x-3">
            <input
              id="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-5">
              I have read and agree to the{' '}
              <Link href="/user/terms" target="_blank" className="text-gray-600 hover:text-gray-500 underline">
                Terms & Conditions
              </Link>{' '}
              and the{' '}
              <Link href="/user/privacy" target="_blank" className="text-gray-600 hover:text-gray-500 underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !acceptTerms}
            className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-sky-500 to-sky-500 hover:from-sky-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${loading || !acceptTerms ? 'opacity-70 cursor-not-allowed transform-none' : ''
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/user/auth/login" className="font-semibold text-gray-600 hover:text-gray-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </>
    );
  };

  // Step 2: Email verification
  const renderStep2 = () => {
    return (
      <>
        {/* Logo Section */}
        <div className="text-center mb-8">
          {/* <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div> */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600 text-sm">We've sent a verification code to your email</p>
        </div>

        {verificationError && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {verificationError}
          </div>
        )}

        <form onSubmit={handleEmailVerification} className="space-y-6">
          <div className="p-6 border border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50">
            <p className=" text-sm text-gray-600">
              We've sent a verification code to <strong>{email}</strong> Please do check your inbox and spam or junk folder.
              {/* . Please check your inbox and enter the code below. */}
            </p>


            {/* <p className="mb-4 text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Please do check your inbox and spam or junk folder.
              </p> */}

            <input
              type="text"
              value={emailOtpInput}
              onChange={(e) => handleOtpInput(e, setEmailOtpInput)}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200 mt-2"
              placeholder="Enter 6-digit verification code"
              maxLength={6}
              inputMode="numeric"
            />

            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={handleResendEmailOTP}
                disabled={emailResendCooldown > 0}
                className={`text-sm font-semibold ${emailResendCooldown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-600 hover:text-red-500 transition-colors'
                  }`}
              >
                {emailResendCooldown > 0
                  ? `Resend code in ${emailResendCooldown}s`
                  : 'Resend verification code'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="order-2 sm:order-1 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              onClick={() => setCurrentStep(1)}
            >
              Back
            </button>

            <button
              type="submit"
              disabled={verificationLoading || emailOtpInput.length !== 6}
              className={`order-1 sm:order-2 flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${verificationLoading || emailOtpInput.length !== 6 ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
            >
              {verificationLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Email & Complete Registration'
              )}
            </button>
          </div>
        </form>
      </>
    );
  };



  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8 sm:pb-12 flex flex-col items-center justify-center">
      {/* mt-25 */}
      <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl border border-white/20 w-full max-w-md">
        {renderStepIndicator()}
        {renderCurrentStep()}
      </div>
    </div>
  );
} 