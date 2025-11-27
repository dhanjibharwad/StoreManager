/* eslint-disable */

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';
// import Link from 'next/link';
// import Image from 'next/image';
// import { FaLock, FaUser, FaEye, FaEyeSlash, FaIdCard, FaEnvelope, FaPhone } from 'react-icons/fa';

// export default function SetupCredentialsPage() {
//   const [adminPassword, setAdminPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [userId, setUserId] = useState<string | null>(null);
//   const [userName, setUserName] = useState<string>('');
//   const [userEmail, setUserEmail] = useState<string>('');
//   const [userPhone, setUserPhone] = useState<string>('');
//   const [userRole, setUserRole] = useState<string | null>(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const router = useRouter();

//   // Check for logged-in user on component mount
//   useEffect(() => {
//     const checkCurrentUser = async () => {
//       try {
//         // Get token from localStorage
//         const token = localStorage.getItem('authToken');

//         if (!token) {
//           setError('You must be logged in to set up admin credentials');
//           setLoading(false);
//           return;
//         }

//         // Verify the session
//         const { data: session, error: sessionError } = await supabase
//           .from('sessions')
//           .select('*, users(*)')
//           .eq('token', token)
//           .single();

//         if (sessionError || !session) {
//           setError('Invalid session. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         // Check if session is expired
//         if (new Date(session.expires_at) < new Date()) {
//           setError('Your session has expired. Please log in again.');
//           setLoading(false);
//           return;
//         }

//         const userData = session.users;

//         // Check if user already has admin credentials
//         if (['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(userData.role)) {
//           const tableName = `${userData.role}_credentials`;

//           try {
//             const { data: existingCreds, error: credsError } = await supabase
//               .from(tableName)
//               .select('*')
//               .eq('user_id', userData.id)
//               .single();

//             if (existingCreds) {
//               setError('Admin credentials already set up for this account');
//               setLoading(false);
//               return;
//             }
//           } catch (err) {
//             // If there's an error, it likely means credentials don't exist, which is what we want
//             console.log('No admin credentials found, proceeding with setup');
//           }
//         }

//         // Set user data
//         setUserId(userData.id);
//         setUserName(userData.name);
//         setUserEmail(userData.email);
//         setUserPhone(userData.phone);
//         setUserRole(userData.role);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error checking user session:', err);
//         setError('An unexpected error occurred');
//         setLoading(false);
//       }
//     };

//     checkCurrentUser();
//   }, []);

//   const handleSetupCredentials = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     // Basic validations
//     if (adminPassword !== confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }

//     if (adminPassword.length < 8) {
//       setError('Password must be at least 8 characters long');
//       setLoading(false);
//       return;
//     }

//     if (!userId) {
//       setError('User information not found');
//       setLoading(false);
//       return;
//     }

//     try {
//       // Call the API endpoint to set up admin credentials
//       const response = await fetch('/api/admin/setup-credentials', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           userId,
//           role: userRole, // This might be null if the user doesn't have a role yet
//           adminPassword,
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         setError(result.error || 'Failed to set up admin credentials');
//         setLoading(false);
//         return;
//       }

//       setSuccess('Admin credentials set up successfully');
//       setUserRole(result.role); // Update role with what was actually set

//       // Clear form
//       setAdminPassword('');
//       setConfirmPassword('');

//       // Redirect to login after short delay
//       setTimeout(() => {
//         router.push('/vendor/login');
//       }, 2000);
//     } catch (err) {
//       console.error('Error setting up credentials:', err);
//       setError('An unexpected error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           <p className="mt-3 text-lg text-gray-700">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
//         <div className="text-center">
//           <div className="flex justify-center">
//             <Image 
//               src="/images/newlogo.png" 
//               alt="Logo" 
//               width={150} 
//               height={80} 
//               className="h-16 w-auto bg-indigo-500 rounded-md border" 
//             />
//           </div>
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Setup Admin Credentials</h2>
//           {userId && (
//             <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
//               <div className="space-y-2">
//                 <div className="grid grid-cols-3 gap-2">
//                   <div className="col-span-1 text-sm font-medium text-gray-500 text-left">Name</div>
//                   <div className="col-span-2 text-sm text-gray-900 text-left">{userName}</div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-2">
//                   <div className="col-span-1 text-sm font-medium text-gray-500 text-left">Email</div>
//                   <div className="col-span-2 text-sm text-gray-900 text-left">{userEmail}</div>
//                 </div>
//                 <div className="grid grid-cols-3 gap-2">
//                   <div className="col-span-1 text-sm font-medium text-gray-500 text-left">Role</div>
//                   <div className="col-span-2 text-sm text-gray-900 text-left capitalize">{userRole}</div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <FaLock className="h-5 w-5 text-red-500" />
//               </div>    
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {success && (
//           <div className="bg-green-50 border-l-4 border-green-500 p-4">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-green-700">{success}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {userId ? (
//           <form className="mt-8 space-y-6" onSubmit={handleSetupCredentials}>
//             <div className="-space-y-px">
//               <div className="mb-4">
//                 <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
//                   Admin Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaLock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="admin-password"
//                     name="adminPassword"
//                     type={showPassword ? "text" : "password"}
//                     required
//                     value={adminPassword}
//                     onChange={(e) => setAdminPassword(e.target.value)}
//                     className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     placeholder="Admin Password (min 8 characters)"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <FaEyeSlash className="h-5 w-5 text-gray-400" />
//                     ) : (
//                       <FaEye className="h-5 w-5 text-gray-400" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
//                   Confirm Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <FaLock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="confirm-password"
//                     name="confirmPassword"
//                     type={showConfirmPassword ? "text" : "password"}
//                     required
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                     placeholder="Confirm Password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   >
//                     {showConfirmPassword ? (
//                       <FaEyeSlash className="h-5 w-5 text-gray-400" />
//                     ) : (
//                       <FaEye className="h-5 w-5 text-gray-400" />
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
//               >
//                 {loading ? (
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 ) : null}
//                 {loading ? 'Setting Up...' : 'Set Up Admin Credentials'}
//               </button>
//             </div>
//           </form>
//         ) : (
//           <div className="mt-8 text-center">
//             <Link href="/vendor/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//               Go to Login
//             </Link>
//           </div>
//         )}



//       </div>
//     </div>
//   );
// } 





'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FaLock, FaUser, FaEye, FaEyeSlash, FaIdCard, FaEnvelope, FaPhone, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';

export default function SetupCredentialsPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  // Check for logged-in user on component mount
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('authToken');

        if (!token) {
          setError('You must be logged in to set up admin credentials');
          setLoading(false);
          return;
        }

        // Verify the session
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('*, users(*)')
          .eq('token', token)
          .single();

        if (sessionError || !session) {
          setError('Invalid session. Please log in again.');
          setLoading(false);
          return;
        }

        // Check if session is expired
        if (new Date(session.expires_at) < new Date()) {
          setError('Your session has expired. Please log in again.');
          setLoading(false);
          return;
        }

        const userData = session.users;

        // Check if user already has admin credentials
        if (['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(userData.role)) {
          const tableName = `${userData.role}_credentials`;

          try {
            const { data: existingCreds, error: credsError } = await supabase
              .from(tableName)
              .select('*')
              .eq('user_id', userData.id)
              .single();

            if (existingCreds) {
              // Redirect immediately for existing credentials
              router.push('/vendor/login');
              return;
            }
          } catch (err) {
            // If there's an error, it likely means credentials don't exist, which is what we want
            console.log('No admin credentials found, proceeding with setup');
          }
        }

        // Set user data
        setUserId(userData.id);
        setUserName(userData.name);
        setUserEmail(userData.email);
        setUserPhone(userData.phone);
        setUserRole(userData.role);
        setLoading(false);
      } catch (err) {
        console.error('Error checking user session:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, [router]);

  const handleSetupCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validations
    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (adminPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError('User information not found');
      setLoading(false);
      return;
    }

    try {
      // Call the API endpoint to set up admin credentials
      const response = await fetch('/api/admin/setup-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: userRole, // This might be null if the user doesn't have a role yet
          adminPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to set up admin credentials');
        setLoading(false);
        return;
      }

      // Redirect immediately after successful setup
        router.push('/vendor/login');
    } catch (err) {
      console.error('Error setting up credentials:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (loading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-3">
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-base font-medium text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <Link href="/vendor/login" className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              <FaArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Back to Login
            </Link>
            <div className="flex items-center">
              <FaShieldAlt className="h-4 w-4 sm:h-5 sm:w-5 text-black mr-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Admin Setup</span>
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
              Setup Admin Credentials
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              Create secure admin access for your account
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 max-w-4xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800">Error</h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 max-w-4xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-green-800">Success!</h3>
                  <p className="text-xs sm:text-sm text-green-700 mt-1">{success}</p>
                  <p className="text-xs text-green-600 mt-1">Redirecting to login...</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Card */}
          {userId ? (
            <div className="max-w-7xl mx-auto">
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
                          Account Information
                        </h2>
                        <p className="text-gray-300 text-xs sm:text-sm">
                          Your profile details and account settings
                        </p>
                      </div>

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
                    </div>
                  </div>

                  {/* Right Side - Setup Form */}
                  <div className="p-4 sm:p-6 lg:p-8 bg-white flex flex-col justify-center order-2 lg:order-2">
                    <div className="text-center lg:text-left mb-6 sm:mb-8">
                      <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2">
                        Create Admin Password
                      </h2>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Set up secure admin credentials for your account
                      </p>
                    </div>

                    <form onSubmit={handleSetupCredentials} className="space-y-4 sm:space-y-6">
                      <div className="space-y-4 sm:space-y-5">
                        {/* Admin Password */}
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
                              type={showPassword ? "text" : "password"}
                              required
                              value={adminPassword}
                              onChange={(e) => setAdminPassword(e.target.value)}
                              className="appearance-none rounded-lg sm:rounded-xl relative block w-full px-3 py-3 sm:py-4 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                              placeholder="Enter admin password (min 8 characters)"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <FaEyeSlash className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              ) : (
                                <FaEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {adminPassword.length > 0 && adminPassword.length < 8 && (
                            <p className="mt-1 text-xs text-red-600">Password must be at least 8 characters</p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label htmlFor="confirm-password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            </div>
                            <input
                              id="confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="appearance-none rounded-lg sm:rounded-xl relative block w-full px-3 py-3 sm:py-4 pl-10 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors"
                              placeholder="Confirm your password"
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
                          {confirmPassword.length > 0 && adminPassword !== confirmPassword && (
                            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                          )}
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Password Requirements:</h4>
                        <ul className="text-xs text-gray-600 space-y-1 sm:space-y-2">
                          <li className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 sm:mr-3 ${adminPassword.length >= 8 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                            At least 8 characters long
                          </li>
                          <li className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 sm:mr-3 ${adminPassword === confirmPassword && adminPassword.length > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                            Passwords match
                          </li>
                        </ul>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || adminPassword.length < 8 || adminPassword !== confirmPassword}
                        className={`w-full flex justify-center items-center py-3 sm:py-4 px-4 sm:px-6 border border-transparent rounded-lg sm:rounded-xl shadow-sm text-xs sm:text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors ${loading || adminPassword.length < 8 || adminPassword !== confirmPassword
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
                            Setting Up...
                          </>
                        ) : (
                          <>
                            <FaShieldAlt className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Set Up Admin Credentials
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 text-center max-w-md mx-auto">
              <FaLock className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Please log in to continue with admin setup</p>
              <Link
                href="/vendor/login"
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
              >
                <FaArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}