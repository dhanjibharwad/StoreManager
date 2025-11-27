/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Users, Trash2, Eye, Check, X, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import Loader from "../components/Loader";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  created_at: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
}

export default function ViewRegularUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or('role.eq.user,role.is.null')
      .order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id: string, status: 'active' | 'disabled') => {
    console.log(`Updating user ${id} to status: ${status}`);
    const { error } = await supabase.from('users').update({ status }).eq('id', id);
    if (error) {
      console.error('Status update failed:', error.message);
    } else {
      fetchUsers();
    }
  };

  const confirmDelete = (id: string) => {
    setShowConfirm(id);
  };

  const handleDeleteConfirmed = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    setShowConfirm(null);
    fetchUsers();
  };

  const handleView = (id: string) => {
    router.push(`/vendor/adminpanel/userlist/${id}`);
  };

  const filteredUsers = users.filter(user => {
    // Only include users with role 'user' or null role (which defaults to 'user')
    const isUserRole = !user.role || user.role === 'user';
    
    if (!isUserRole) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-3 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Regular User Management</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage regular users only</p>
            </div>
            <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
                {/* <Link 
                href="/vendor/adminpanel/userlist" 
                className="hover:text-gray-900 transition-colors"
                >
                User List
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" /> */}
                <span className="text-gray-900 font-medium">User List</span>
            </nav>
          </div>
          </div>

          <div className="mt-2 sm:mt-0 relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Users Table Card */}
        <div className="bg-white rounded-xl shadow-md border">
          <div className="p-4 sm:p-5 border-b">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Regular Users</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Total {users.length} regular users registered</p>
              </div>
            </div>
          </div>
          
          <div className="p-0 sm:p-0">
            {loading ? (
              // <div className="p-8 flex justify-center">
              //   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              // </div>
              <div className="p-8 flex justify-center">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Verified</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Verified</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          No users found matching your search criteria
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium">
                                {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'superadmin' ? 'bg-indigo-100 text-indigo-800' :
                              user.role === 'rentaladmin' ? 'bg-green-100 text-green-800' :
                              user.role === 'eventadmin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'ecomadmin' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                            {user.is_email_verified ? (
                              <span className="inline-flex items-center text-green-600">
                                <Check className="h-4 w-4 mr-1" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600">
                                <X className="h-4 w-4 mr-1" /> Not Verified
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                            {user.is_phone_verified ? (
                              <span className="inline-flex items-center text-green-600">
                                <Check className="h-4 w-4 mr-1" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600">
                                <X className="h-4 w-4 mr-1" /> Not Verified
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDate(user.created_at)}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              onClick={() => handleView(user.id)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            {isSuperAdmin && (
                              <Button
                                onClick={() => confirmDelete(user.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
              <Button
                onClick={() => setShowConfirm(null)}
                className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteConfirmed(showConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
