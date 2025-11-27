/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Users, Trash2, Eye, Check, X, Clock, Search, Shield, ShieldCheck, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Loader from '../components/Loader';

// import Link from 'next/link';
// import { ChevronRight } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  created_at: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
}

export default function ViewAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    superadmin: true,
    HRadmin: true,
    eventadmin: true,
    ecomadmin: true
  });
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [unauthorizedAttempt, setUnauthorizedAttempt] = useState(false);
  const router = useRouter();

  const fetchAdmins = async () => {
    setLoading(true);
    
    // If user is not a superadmin, only fetch admins of their role type
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (currentUserRole && currentUserRole !== 'superadmin') {
      // Only fetch admins of the same role type
      query = query.eq('role', currentUserRole);
    } else {
      // For superadmins or before we know the role, fetch all admin types
      query = query.in('role', ['superadmin', 'HRadmin', 'eventadmin', 'ecomadmin']);
    }
    
    const { data, error } = await query;
    
    if (!error && data) setAdmins(data);
    setLoading(false);
  };

  useEffect(() => {
    checkCurrentUserRole();
  }, []);
  
  useEffect(() => {
    // Fetch admins once we know the current user role
    if (currentUserRole) {
      fetchAdmins();
    }
  }, [currentUserRole]);

  const checkCurrentUserRole = async () => {
    try {
      // Check current admin's role
      const response = await fetch('/api/admin/check-credentials');
      if (response.ok) {
        const sessionData = await response.json();
        setCurrentUserRole(sessionData.user?.role || null);
      }
    } catch (error) {
      console.error('Error checking admin credentials:', error);
    }
  };

  const confirmDelete = (id: string) => {
    // Only allow superadmins to delete other admins
    if (currentUserRole !== 'superadmin') {
      setUnauthorizedAttempt(true);
      setTimeout(() => setUnauthorizedAttempt(false), 3000);
      return;
    }
    setShowConfirm(id);
  };

  const handleDeleteConfirmed = async (id: string) => {
    try {
      // Double-check that the current user is a superadmin
      if (currentUserRole !== 'superadmin') {
        console.error('Unauthorized attempt to remove admin privileges');
        return;
      }

      // First, find the admin's role to determine which credentials table to delete from
      const adminToDelete = admins.find(admin => admin.id === id);
      if (adminToDelete && adminToDelete.role) {
        const credentialsTable = `${adminToDelete.role.toLowerCase()}_credentials`;
        
        // Delete from the specific admin credentials table
        await supabase
          .from(credentialsTable)
          .delete()
          .eq('user_id', id);
          
        // Update the user role to 'user'
        await supabase
          .from('users')
          .update({ role: 'user' })
          .eq('id', id);
      }
      
      setShowConfirm(null);
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const handleView = (id: string) => {
    router.push(`/vendor/adminpanel/userlist/${id}`);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredAdmins = (role: string) => {
    return admins.filter(admin => {
      const matchesRole = admin.role === role;
      if (!matchesRole) return false;
      
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        admin.name?.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower) ||
        admin.phone?.toLowerCase().includes(searchLower)
      );
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch(role) {
      case 'superadmin':
         return 'bg-amber-100 text-amber-800';
      case 'HRadmin':
        return 'bg-green-100 text-green-800';
      case 'eventadmin':
        return 'bg-purple-100 text-purple-800';
      case 'ecomadmin':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleHeaderColor = (role: string) => {
    switch(role) {
      case 'superadmin':
        return 'bg-amber-50 border-amber-200';
      case 'HRadmin':
        return 'bg-green-50 border-green-200';
      case 'eventadmin':
        return 'bg-purple-50 border-purple-200';
      case 'ecomadmin':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getRoleIconColor = (role: string) => {
    switch(role) {
      case 'superadmin':
        return 'text-amber-500';
      case 'HRadmin':
        return 'text-green-500';
      case 'eventadmin':
        return 'text-purple-500';
      case 'ecomadmin':
        return 'text-indigo-500';
      default:
        return 'text-gray-500';
    }
  };

  // Determine which admin tables should be displayed based on the current user's role
  const shouldShowTable = (role: string) => {
    if (!currentUserRole) return false; // Don't show any tables until we know the role
    if (currentUserRole === 'superadmin') return true; // Superadmins see all tables
    return currentUserRole === role; // Other admins only see their own table
  };

  const renderAdminTable = (role: string, displayName: string) => {
    // Skip rendering if this table shouldn't be shown for the current user
    if (!shouldShowTable(role)) return null;
    
    const filteredList = filteredAdmins(role);
    const isExpanded = expandedSections[role as keyof typeof expandedSections];
    
    return (
      <div className="bg-white rounded-xl shadow-md border mb-6">
        <div className={`p-4 sm:p-5 border-b ${getRoleHeaderColor(role)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 bg-white rounded-lg mr-3 shadow-sm`}>
                {role === 'superadmin' ? (
                  <ShieldCheck className={`h-5 w-5 ${getRoleIconColor(role)}`} />
                ) : (
                  <Shield className={`h-5 w-5 ${getRoleIconColor(role)}`} />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">{displayName}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Total {filteredList.length} administrators</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSection(role as keyof typeof expandedSections)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-0 sm:p-0">
            {loading ? (
              // <div className="p-8 flex justify-center">
              //   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              // </div>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Verified</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Verified</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No {displayName.toLowerCase()} found matching your search criteria
                        </td>
                      </tr>
                    ) : (
                      filteredList.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                                {admin.name?.charAt(0)?.toUpperCase() || admin.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{admin.name || 'Unnamed Admin'}</div>
                                <div className="text-sm text-gray-500">{admin.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{admin.phone || '-'}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.is_email_verified ? (
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
                            {admin.is_phone_verified ? (
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
                              {formatDate(admin.created_at)}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              onClick={() => handleView(admin.id)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            
                            {/* Only show remove button if current user is a superadmin */}
                            {currentUserRole === 'superadmin' && (
                              <Button
                                onClick={() => confirmDelete(admin.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Remove
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
        )}
      </div>
    );
  };

  // Get the display name for the current admin role
  const getCurrentRoleDisplayName = () => {
    switch(currentUserRole) {
      case 'superadmin':
        return 'Super Administrator';
      case 'HRadmin':
        return 'HR Administrator';
      case 'eventadmin':
        return 'Event Administrator';
      case 'ecomadmin':
        return 'E-commerce Administrator';
      default:
        return 'Administrator';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-3 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <div className="mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Management</h1>
              {currentUserRole && currentUserRole !== 'superadmin' && (
                <p className="text-sm text-gray-500 mt-1">
                  View {getCurrentRoleDisplayName()} list
                </p>
              )}
              {currentUserRole === 'superadmin' && (
                <p className="text-sm text-gray-500 mt-1">View and manage all system administrators</p>
              )}
            </div>
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                {/* <Link 
                  href="/vendor/adminpanel/userlist" 
                  className="hover:text-gray-900 transition-colors"
                >
                  User List
                </Link> 
                <ChevronRight className="h-4 w-4 text-gray-400" />*/}
                <span className="text-gray-900 font-medium">Admin List</span>
              </nav>
            </div>
          </div>

          <div className="mt-2 sm:mt-0 relative">
            <input
              type="text"
              placeholder="Search admins..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Unauthorized attempt notification */}
        {unauthorizedAttempt && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Only superadmins can remove admin privileges</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Role-specific message for non-superadmins */}
        {currentUserRole && currentUserRole !== 'superadmin' && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className={`h-5 w-5 text-${getRoleIconColor(currentUserRole).split('-')[1]}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  You are viewing the {getCurrentRoleDisplayName()} list. As a {getCurrentRoleDisplayName()}, 
                  you can only see administrators with the same role.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Tables by Role - only shown if the user should see them */}
        {renderAdminTable('superadmin', 'Super Administrators')}
        {renderAdminTable('HRadmin', 'HR Administrators')}
        {renderAdminTable('eventadmin', 'Event Administrators')}
        {renderAdminTable('ecomadmin', 'E-commerce Administrators')}
        
        {/* Show a message when no tables are visible yet (during loading) */}
        {loading && !currentUserRole && (
            // <div className="p-8 flex justify-center">
            //   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            // </div>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <Loader />
            </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Remove Admin Privileges</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              This will remove admin privileges from this user. They will still exist as a regular user, but will no longer have admin access.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowConfirm(null)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteConfirmed(showConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 