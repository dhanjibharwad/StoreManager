/* eslint-disable */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuthData } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FaLock, FaEye, FaEyeSlash, FaIdCard, FaEnvelope, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

export default function AdminLoginPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);
  const router = useRouter();

  // Check for logged-in user on component mount
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('authToken');

        if (!token) {
          return;
        }

        // Verify the session
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('*, users(*)')
          .eq('token', token)
          .single();

        if (sessionError || !session) {
          return;
        }

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
          return;
        }

        const userData = session.users;

        // Set user data
        setUserId(userData.id);
        setUserName(userData.name);
        setUserEmail(userData.email);
        setUserRole(userData.role || 'Regular User');

        // Check if admin credentials exist
        if (userData.role && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(userData.role)) {
          const tableName = `${userData.role.toLowerCase()}_credentials`;
          const { data: credentials, error: credError } = await supabase
            .from(tableName)
            .select('id')
            .eq('user_id', userData.id)
            .single();

          setHasCredentials(!!credentials && !credError);
        }
      } catch (err) {
        console.error('Error checking user session:', err);
      }
    };

    checkCurrentUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!adminPassword) {
      setError('Admin password is required');
      setLoading(false);
      return;
    }

    try {
      // Call the admin login API with just the admin password
      const response = await fetch('/api/admin/login/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save auth data
      saveAuthData(result.session.token, 'adminAuthToken');

      // Redirect to admin panel
      router.push('/vendor/adminpanel');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <Link href="/user/home" className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              <FaArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center">
              <FaShieldAlt className="h-4 w-4 sm:h-5 sm:w-5 text-black mr-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Admin Login</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full space-y-4 sm:space-y-6">
          {/* Logo and Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">
              Admin Login
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Access your administrative dashboard
            </p>
          </div>


          <div className="max-w-7xl mx-auto w-full">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-white overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left Side - Account Information */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden order-1 lg:order-1">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-10 -mt-10 sm:-mr-16 sm:-mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12"></div>

                  <div className="relative z-10 h-full flex flex-col justify-center">
                    <div className="text-center lg:text-left mb-6 sm:mb-8">
                      <div className="flex justify-center lg:justify-start mb-4 sm:mb-6">
                        {/* <div className="p-1 rounded-xl sm:rounded-2xl border border-white/10">
                          <Image
                            src="/images/unlogo1.png"
                            alt="Logo"
                            width={220}
                            height={100}
                            className="h-8 sm:h-10 lg:h-12 w-auto"
                          />
                        </div> */}
                      </div>

                      <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2">
                        Admin Portal
                      </h2>
                      <p className="text-gray-300 text-xs sm:text-sm">
                        Access your administrative dashboard
                      </p>
                    </div>

                    {userId ? (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Name */}
                        <div className="group">
                          <div className="flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10">
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 mr-3 sm:mr-4 shadow-md flex-shrink-0">
                              <FaIdCard className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">{userName}</p>
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
                              <p className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">{userEmail}</p>
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
                                {userRole || 'Not assigned'}
                              </span>
                              <p className="text-gray-400 text-xs uppercase tracking-wide mt-1 sm:mt-2">Account Role</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6">
                          <p className="text-white text-sm sm:text-base">
                            Please sign in with your user account first to access the admin panel.
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="p-4 sm:p-6 lg:p-8 bg-white flex flex-col justify-center order-2 lg:order-2">
                  <div className="text-center lg:text-left mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                      Admin Login
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {userId
                        ? 'Enter your admin password to continue'
                        : 'Enter your admin password to access the panel'}
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

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <label htmlFor="admin-password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Admin Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          id="admin-password"
                          name="adminPassword"
                          type={showAdminPassword ? "text" : "password"}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          className="appearance-none rounded-lg sm:rounded-xl relative block w-full px-3 py-3 sm:py-4 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                          placeholder="Enter admin password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                        >
                          {showAdminPassword ? (
                            <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          ) : (
                            <FaEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>

                      <div className="text-sm">
                        <Link href="/vendor/forgot-password" className="font-medium text-black hover:text-gray-800">
                          Forgot password?
                        </Link>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex justify-center items-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent rounded-lg sm:rounded-xl shadow-sm text-xs sm:text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <FaLock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Sign in
                        </>
                      )}
                    </button>

                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pt-4 border-t border-gray-200">
                      <Link href="/user/home" className="text-sm font-medium text-black hover:text-gray-800">
                        Back to main site
                      </Link>

                      {!hasCredentials && userId && (
                        <Link href="/vendor/setup-credentials" className="text-sm font-medium text-black hover:text-gray-800">
                          Setup Admin Credentials
                        </Link>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
} 