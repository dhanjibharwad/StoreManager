'use client';

import { useEffect, useState } from 'react';     // uday change
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FaLock, FaEye, FaEyeSlash, FaKey, FaEnvelope, FaIdCard, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];

        if (token) {
          const { data: session } = await supabase
            .from('sessions')
            .select('*, users(name, email, role)')
            .eq('token', token)
            .single();

          if (session?.users) {
            const user = session.users;
            setUserDetails({
              name: user.name,
              email: user.email,
              role: user.role
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleSendOTP = async (isResend: boolean = false) => {
    if (!userDetails?.email) {
      setError('No email found');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (!isResend) {
        setSuccess('');
      }

      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userDetails.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('User not found in admin system. Please use setup credentials page first.');
        } else if (response.status === 403) {
          setError('Unauthorized. Only admin users can use this feature.');
        } else if (response.status === 400 && data.error.includes('not set up')) {
          setError('Admin password not set up yet. Please use setup credentials page first.');
        } else {
          setError(data.error || 'Failed to send OTP');
        }
        return;
      }

      setSuccess(isResend ? 'New OTP has been sent to your email' : 'OTP has been sent to your email');
      setOtpSent(true);
      setCooldown(60);
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userDetails?.email || !otp || !newPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/admin/forgot-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userDetails.email,
          otp,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to verify OTP');
        return;
      }

      setSuccess('Password has been successfully reset');
      setTimeout(() => {
        router.push('/vendor/login');
      }, 2000);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <Link href="/vendor/login" className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              <FaArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Back to Login
            </Link>
            <div className="flex items-center">
            <FaShieldAlt className="h-4 w-4 sm:h-5 sm:w-5 text-black mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">Password Reset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full space-y-4 sm:space-y-6">
          {/* Logo and Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Reset Admin Password
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Recover access to your admin account
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto w-full">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left Side - Account Information */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-4 sm:p-6 lg:p-8 relative overflow-hidden order-1 lg:order-1">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-10 -mt-10 sm:-mr-16 sm:-mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12"></div>

                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <div className="text-center lg:text-left mb-6 sm:mb-8">
                      <div className="flex justify-center lg:justify-start mb-4 sm:mb-6">
                        <div className="p-1 rounded-xl sm:rounded-2xl border border-white/10">
                          <Image 
                            src="/images/newlogo.png"
                            alt="Logo" 
                            width={120} 
                            height={60} 
                            className="h-8 sm:h-10 lg:h-12 w-auto" 
                          />
                        </div>
                      </div>

                      <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2">
                        Account Recovery
                      </h2>
                      <p className="text-gray-300 text-xs sm:text-sm">
                        Verify your identity to reset your password
                      </p>
                    </div>

                    {userDetails ? (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Name */}
                        <div className="group">
                          <div className="flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 mr-3 sm:mr-4 shadow-md flex-shrink-0">
                              <FaIdCard className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">{userDetails.name}</p>
                              <p className="text-gray-400 text-xs uppercase tracking-wide">Full Name</p>
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                          <div className="flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 mr-3 sm:mr-4 shadow-md flex-shrink-0">
                              <FaEnvelope className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">{userDetails.email}</p>
                              <p className="text-gray-400 text-xs uppercase tracking-wide">Email Address</p>
                            </div>
                          </div>
                        </div>

                        {/* Role */}
                        <div className="group">
                          <div className="flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 mr-3 sm:mr-4 shadow-md flex-shrink-0">
                              <FaShieldAlt className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="inline-flex items-center px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-500 capitalize shadow-lg">
                                {userDetails.role || 'Not assigned'}
                              </span>
                              <p className="text-gray-400 text-xs uppercase tracking-wide mt-1 sm:mt-2">Account Role</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6">
                        <p className="text-white text-sm sm:text-base">
                          Please sign in with your user account first to reset your admin password.
                        </p>
                        <div className="mt-4">
                          <Link 
                            href="/user/auth/login" 
                            className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-colors"
                          >
                            Go to User Login
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Reset Form */}
                <div className="p-4 sm:p-6 lg:p-8 bg-white flex flex-col justify-center order-2 lg:order-2">
                  <div className="text-center lg:text-left mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                      {otpSent ? 'Verify OTP & Reset Password' : 'Request Password Reset'}
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {otpSent 
                        ? 'Enter the OTP sent to your email and set a new password' 
                        : 'We will send a one-time password to your email'}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaLock className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-green-700">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {userDetails ? (
                    <form onSubmit={otpSent ? handleVerifyOTP : (e) => { e.preventDefault(); handleSendOTP(false); }} className="space-y-4 sm:space-y-6">
                      {otpSent && (
                        <div className="space-y-4 sm:space-y-5">
                          <div>
                            <label htmlFor="otp" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              Enter OTP
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaKey className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              </div>
                              <input
                                id="otp"
                                name="otp"
                                type="text"
                                maxLength={6}
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="appearance-none rounded-lg sm:rounded-xl relative block w-full px-3 py-3 sm:py-4 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                placeholder="Enter OTP"
                              />
                            </div>
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSendOTP(true)}
                                disabled={cooldown > 0 || loading}
                                className="text-xs sm:text-sm text-black hover:text-gray-800 disabled:text-gray-400 transition-colors"
                              >
                                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="newPassword" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              </div>
                              <input
                                id="newPassword"
                                name="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="appearance-none rounded-lg sm:rounded-xl relative block w-full px-3 py-3 sm:py-4 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                placeholder="New Password"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                ) : (
                                  <FaEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              </div>
                              <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none rounded-lg sm:rounded-xl relative block w-full px-3 py-3 sm:py-4 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                                placeholder="Confirm Password"
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                ) : (
                                  <FaEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Password Requirements */}
                          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Password Requirements:</h4>
                            <ul className="text-xs text-gray-600 space-y-1 sm:space-y-2">
                              <li className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 sm:mr-3 ${newPassword.length >= 8 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                At least 8 characters long
                              </li>
                              <li className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 sm:mr-3 ${newPassword === confirmPassword && newPassword.length > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                Passwords match
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || (otpSent && (newPassword.length < 8 || newPassword !== confirmPassword))}
                        className={`w-full flex justify-center items-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent rounded-lg sm:rounded-xl shadow-sm text-xs sm:text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors ${
                          loading || (otpSent && (newPassword.length < 8 || newPassword !== confirmPassword))
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:shadow-lg'
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            {otpSent ? (
                              <>
                                <FaKey className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Reset Password
                              </>
                            ) : (
                              <>
                                <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Send OTP
                              </>
                            )}
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <div className="text-sm text-yellow-700">
                        Please log in first to verify your identity.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 