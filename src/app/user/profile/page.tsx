"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaLock, FaTrash, FaEye, FaEyeSlash, FaPhone, FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  // State for display/edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for user profile data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_email_verified: false,
    is_phone_verified: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [showPasswordDropdown, setShowPasswordDropdown] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/user/auth/login');
    }
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        is_email_verified: user.is_email_verified || false,
        is_phone_verified: user.is_phone_verified || false
      });
    }
  }, [user, isAuthenticated, authLoading, router]);



  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone
        })
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || `Failed to update profile: ${response.status}`);
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json().catch(() => ({}));
      
      setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
      setIsEditMode(false); // Exit edit mode after successful update
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        setPasswordLoading(false);
        return;
      }

      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change password');

      setMessage({ type: 'success', text: 'Password changed successfully! You will be logged out in 3 seconds...' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Auto logout after password change
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found' });
        setDeleteLoading(false);
        return;
      }

      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete account');

      localStorage.removeItem('authToken');
      router.push('/user/auth/login');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete account' });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-500 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-100 mt-2">Manage your account information and preferences</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
                {message.text}
              </div>
            )}

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  {/* <FaUser className="mr-2 text-gray-600" /> */}
                  Profile Information
                </h2>
                {!isEditMode && (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center text-gray-900 hover:text-gray-800"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                )}
              </div>
              
              {isEditMode ? (
                // Edit Mode
                <form onSubmit={handleProfileUpdate} className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-gray-100"
                        readOnly
                      />
                      <div className="absolute right-3 top-2.5">
                        {formData.is_email_verified ? 
                          <FaCheckCircle className="text-green-500" title="Verified" /> : 
                          <FaTimesCircle className="text-gray-500" title="Not verified" />}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        required
                      />
                      <div className="absolute right-3 top-2.5">
                        {formData.is_phone_verified ? 
                          <FaCheckCircle className="text-green-500" title="Verified" /> : 
                          <FaTimesCircle className="text-gray-500" title="Not verified" />}
                      </div>
                    </div>
                  </div>
                  

                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <div className="space-y-6">
                  
                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center">
                          <FaUser className="mr-2 text-gray-600" /> Name
                        </h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">{formData.name || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center">
                          <FaEnvelope className="mr-2 text-gray-600" /> Email
                        </h3>
                        <div className="flex items-center mt-1">
                          <p className="text-lg font-medium text-gray-900 mr-2">{formData.email || 'Not provided'}</p>
                          {formData.is_email_verified ? 
                            <FaCheckCircle className="text-green-500" title="Verified" /> : 
                            <FaTimesCircle className="text-red-500" title="Not verified" />}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 flex items-center">
                          <FaPhone className="mr-2 text-gray-600" /> Phone
                        </h3>
                        <div className="flex items-center mt-1">
                          <p className="text-lg font-medium text-gray-900 mr-2">{formData.phone || 'Not provided'}</p>
                          {formData.is_phone_verified ? 
                            <FaCheckCircle className="text-green-500" title="Verified" /> : 
                            <FaTimesCircle className="text-red-500" title="Not verified" />}
                        </div>
                      </div>
                      
                      {user?.company_name && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 flex items-center">
                            <svg className="mr-2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Company
                          </h3>
                          <p className="mt-1 text-lg font-medium text-blue-600">{user.company_name}</p>
                        </div>
                      )}
                    </div>
                    

                  </div>
                </div>
              )}
            </div>

           

            {/* Password Management */}
            <div className="space-y-6 border-t pt-8">
              {/* <h2 className="text-xl font-semibold text-red-600 flex items-center">
                <FaTrash className="mr-2" />
                Danger Zone
              </h2> */}
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">Password Management</h3>
                  <button
                    onClick={() => setShowPasswordDropdown(!showPasswordDropdown)}
                    className="text-gray-700 hover:text-gray-800 flex items-center text-sm font-medium"
                  >
                    {showPasswordDropdown ? 'Hide Options' : 'Show Options'}
                    <svg className={`ml-1 h-5 w-5 transition-transform ${showPasswordDropdown ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {showPasswordDropdown && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                     <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Changing...
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2" />
                            Change Password
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Delete Account */}
            <div className="space-y-6 border-t pt-8">
              {/* <h2 className="text-xl font-semibold text-red-600 flex items-center">
                <FaTrash className="mr-2" />
                Danger Zone
              </h2> */}
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">Account Management</h3>
                  <button
                    onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
                    className="text-gray-700 hover:text-gray-800 flex items-center text-sm font-medium"
                  >
                    {showDeleteDropdown ? 'Hide Options' : 'Show Options'}
                    <svg className={`ml-1 h-5 w-5 transition-transform ${showDeleteDropdown ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {showDeleteDropdown && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Delete Account</h4>
                    <p className="text-gray-700 mb-4">
                      Once you delete your account, there is no going back. This will permanently delete your account and all associated data.
                    </p>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                    >
                      <FaTrash className="mr-2" />
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full">
              <FaTrash className="w-8 h-8 text-gray-600" />
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Account?</h3>
              <p className="text-gray-600 leading-relaxed">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-6 py-3 bg-gray-600 rounded-lg text-white font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}