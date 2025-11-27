'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import UserRegistrationForm from '@/components/UserRegistrationForm';

interface Company {
  id: string;
  company_name: string;
}

interface User {
  id: string;
  role: string;
  company_id: string;
}

export default function UserRegisterPage() {
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchCompany();
  }, []);

  const checkAuthAndFetchCompany = async () => {
    try {
      console.log('🔍 Starting authentication check...');
      
      // Get session token from localStorage
      const token = localStorage.getItem('authToken');
      console.log('📝 Token found:', !!token);
      
      if (!token) {
        console.log('❌ No token found');
        router.push('/user/auth/login');
        return;
      }

      // Verify session and get user data
      console.log('🔄 Verifying session...');
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          users(
            id,
            role,
            company_id
          )
        `)
        .eq('token', token)
        .single();

      console.log('📊 Session data:', session);
      console.log('❗ Session error:', sessionError);

      if (sessionError || !session || !session.users) {
        console.log('❌ Invalid session');
        localStorage.removeItem('authToken');
        router.push('/user/auth/login');
        return;
      }

      // Check if session is expired
      const isExpired = new Date(session.expires_at) < new Date();
      console.log('⏰ Session expired:', isExpired);
      
      if (isExpired) {
        console.log('❌ Session expired');
        localStorage.removeItem('authToken');
        router.push('/user/auth/login');
        return;
      }

      const user = session.users as User;
      console.log('👤 User data:', user);
      console.log('🔑 User role:', user.role);
      console.log('🏢 User company_id:', user.company_id);

      // Check if user is admin
      if (user.role !== 'admin') {
        console.log('❌ User is not admin');
        router.push('/user/home');
        return;
      }

      // Check if user has a company_id
      if (!user.company_id) {
        console.error('❌ Admin user has no company assigned');
        router.push('/user/home');
        return;
      }

      // Fetch user's company details
      console.log('🏢 Fetching company details...');
      const { data: company, error } = await supabase
        .from('companies')
        .select('id, company_name')
        .eq('id', user.company_id)
        .single();
      
      console.log('🏢 Company data:', company);
      console.log('❗ Company error:', error);
      
      if (error || !company) {
        console.error('❌ Error fetching company:', error);
        router.push('/user/home');
        return;
      }

      console.log('✅ Authorization successful!');
      setUserCompany(company);
      setAuthorized(true);
    } catch (error) {
      console.error('💥 Authorization error:', error);
      router.push('/user/auth/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-400"></div>
            <span className="text-gray-600 font-medium">Verifying access...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authorized || !userCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-400 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Register New User</h1>
          <p className="text-gray-600 text-lg">Add a new user to your organization</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Company Info Section */}
          <div className="bg-gradient-to-r from-sky-50 to-gray-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{userCompany.company_name}</h2>
                  <p className="text-gray-600 text-sm">Adding new user to your organization</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/user/home')}
                className="flex items-center px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </button>
            </div>
          </div>

          {/* User Registration Form Section */}
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">User Information</h3>
                <p className="text-gray-600 text-sm">
                  Fill in the details for the new team member
                </p>
              </div>
            </div>
            
            <UserRegistrationForm
              companyId={userCompany.id}
              companyName={userCompany.company_name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
