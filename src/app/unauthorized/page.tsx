/* eslint-disable */
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaHome, FaArrowLeft } from 'react-icons/fa';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <FaLock className="text-red-600 text-2xl" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            <FaArrowLeft size={14} />
            Go Back
          </button>
          
          <Link 
            href="/user/home" 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaHome size={14} />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 