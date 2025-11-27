/* eslint-disable */
'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, Shield, Clock, Mail, Phone, User, Calendar, ChevronRight, FileText, ChevronDown, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';   

interface UserDetails {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    role?: string;
    created_at: string;
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
    updated_at?: string;
    status?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
}



interface ComplaintCounts {
    total: number;
}

interface Complaint {
    id: string;
    user_id: string;
    email: string;
    phone: string;
    address: string;
    device_name: string;
    model_number: string;
    year_of_purchase: number;
    details: string;
    attachments: string[];
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    admin_notes?: string;
    created_at: string;
    updated_at: string;
}

const getRoleIconColor = (role: string) => {
    switch(role) {
      case 'superadmin':
        return 'text-gray-900';
      case 'rentaladmin':
        return 'text-green-600';
      case 'eventadmin':
        return 'text-purple-600';
      case 'ecomadmin':
        return 'text-amber-600';
      default:
        return 'text-gray-500';
    }
};


// Remove the getCurrentRoleDisplayName function that's causing errors

// Add DeleteConfirmationModal component
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Complaint?</h3>
          <p className="text-gray-600 leading-relaxed">
            This action will permanently remove this complaint and cannot be undone. 
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Keep Complaint
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 active:bg-red-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
};

// Add SuccessModal component
const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
        <div className="flex flex-col items-center text-center">
          {/* Success checkmark animation */}
          <div className="w-16 h-16 rounded-full bg-green-100 p-2 flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-green-500 animate-[check_0.5s_ease-in-out_forwards]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Successfully Deleted!
          </h3>
          <p className="text-gray-600 mb-6">
            The complaint has been successfully deleted.
          </p>
          
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800  text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            // bg-gradient-to-r from-purple-600 to-orange-500
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Add RoleConfirmationModal component
const RoleConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  oldRole,
  newRole
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  oldRole: string | undefined;
  newRole: string;
}) => {
  if (!isOpen) return null;

  // Check if we're changing from an admin role to a different role
  const isRemovingAdminRole = oldRole && ['superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].includes(oldRole) && 
                             (newRole !== oldRole);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transform animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Change User Role?</h3>
          <p className="text-gray-600 leading-relaxed mb-2">
            Are you sure you want to change this user's role from <span className="font-semibold">{oldRole || 'user'}</span> to <span className="font-semibold">{newRole}</span>?
          </p>
          
          {isRemovingAdminRole && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-left">
              <p className="text-red-700 text-sm">
                <strong>Warning:</strong> This will delete the user's admin credentials from the {oldRole}_credentials table. This action cannot be undone.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const roleDropdownRef = useRef<HTMLDivElement>(null);

    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [complaintCounts, setComplaintCounts] = useState<ComplaintCounts>({ total: 0 });
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<{complaintId: string} | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [updatingRole, setUpdatingRole] = useState(false);
    const [currentAdminRole, setCurrentAdminRole] = useState<string | null>(null);
    const [showRoleModal, setShowRoleModal] = useState<{oldRole: string | undefined; newRole: string} | null>(null);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }
    };

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);

            if (!userId) {
                setLoading(false);
                return;
            }

            // Check current admin's role
            try {
                const sessionResponse = await fetch('/api/admin/check-credentials');
                if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.json();
                    setCurrentAdminRole(sessionData.user?.role || null);
                }
            } catch (error) {
                console.error('Error checking admin credentials:', error);
            }

            // Fetch user details
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user details:', error);
                setLoading(false);
                return;
            }

            if (data) {
                setUser(data);

                // Fetch complaint counts and data after getting user data
                await fetchComplaintCounts(userId);
                await fetchUserComplaints(userId);
            }

            setLoading(false);
        };

        fetchUserDetails();
    }, [userId]);

    // Fetch user complaints
    const fetchUserComplaints = async (userId: string) => {
        try {
            // Fetch complaints for the user
            const { data: complaintsData, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching user complaints:', error);
                return;
            }

            // Update state with fetched data
            if (complaintsData) {
                setComplaints(complaintsData);
                setComplaintCounts({ total: complaintsData.length });
            }

        } catch (error) {
            console.error('Error fetching user complaints:', error);
        }
    };

    // Fetch complaint counts
    const fetchComplaintCounts = async (userId: string) => {
        try {
            // Fetch complaint count for the user
            const { count: complaintCount, error } = await supabase
                .from('complaints')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching complaint count:', error);
                return;
            }

            setComplaintCounts({ total: complaintCount || 0 });

        } catch (error) {
            console.error('Error fetching complaint counts:', error);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Not available';
        try {
            return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
        } catch (error) {
            return 'Invalid date';
        }
    };



    const handleBack = () => {
        router.back();
    };

    const confirmDelete = async (complaintId: string) => {
        setShowDeleteModal({ complaintId });
    };

    const handleDeleteConfirmed = async () => {
        if (!showDeleteModal) return;
        const { complaintId } = showDeleteModal;

        setIsDeleting(true);
        const toastId = toast.loading('Deleting complaint...');

        try {
            // Delete complaint from database
            const { error } = await supabase
                .from('complaints')
                .delete()
                .eq('id', complaintId);

            if (error) {
                throw new Error(error.message || 'Failed to delete complaint');
            }

            // Update the local state to remove the deleted complaint
            setComplaints(prev => prev.filter(complaint => complaint.id !== complaintId));
            setComplaintCounts(prev => ({ total: prev.total - 1 }));

            toast.success('Complaint deleted successfully', { id: toastId });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error deleting complaint:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete complaint', {
                id: toastId,
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(null);
        }
    };

    const initiateRoleChange = (newRole: string) => {
        if (!user || user.role === newRole) return;
        setShowRoleModal({ oldRole: user.role, newRole });
        setRoleDropdownOpen(false);
    };

    const handleRoleChange = async () => {
        if (!showRoleModal || !user || currentAdminRole !== 'superadmin') return;
        
        const newRole = showRoleModal.newRole;
        setUpdatingRole(true);
        const toastId = toast.loading(`Updating role to ${newRole}...`);

        try {
            // Get the current role before updating
            const oldRole = user.role;

            // Update the role in Supabase
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Delete admin credentials from relevant tables based on the old role
            if (oldRole && oldRole !== 'user') {
                // Determine which admin credentials table to delete from
                const credentialsTables = {
                    'superadmin': 'superadmin_credentials',
                    'rentaladmin': 'rentaladmin_credentials',
                    'eventadmin': 'eventadmin_credentials',
                    'ecomadmin': 'ecomadmin_credentials'
                };
                
                const tableToDeleteFrom = credentialsTables[oldRole as keyof typeof credentialsTables];
                
                if (tableToDeleteFrom) {
                    const { error: deleteError } = await supabase
                        .from(tableToDeleteFrom)
                        .delete()
                        .eq('user_id', userId);
                    
                    if (deleteError) {
                        console.error(`Error deleting from ${tableToDeleteFrom}:`, deleteError);
                        // Continue with the role change even if credential deletion fails
                        // But log the error for debugging
                    }
                }
            }

            // Update local state
            setUser(prev => prev ? { ...prev, role: newRole } : null);
            toast.success(`Role updated to ${newRole}`, { id: toastId });
            setShowRoleModal(null);
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update role', { id: toastId });
        } finally {
            setUpdatingRole(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
                setRoleDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [roleDropdownRef]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div> */}
                <Loader />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="bg-white rounded-xl shadow-md border p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">User Not Found</h2>
                    <p className="text-gray-600 mb-6">The user you are looking for does not exist or has been deleted.</p>
                    <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to User List
                    </Button>
                </div>
            </div>
        );
    }

    // Render complaints section
    const renderComplaintsSection = () => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'in_progress': return 'bg-blue-100 text-blue-800';
                case 'resolved': return 'bg-green-100 text-green-800';
                case 'closed': return 'bg-gray-100 text-gray-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        };

        return (
            <div className="my-8 space-y-6">
                <div id="complaints-section" className="space-y-4 scroll-mt-8">
                    <div className="flex items-start border-b py-2">
                        <div className="p-2 bg-red-50 rounded-lg mr-3">
                            <MessageSquare className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">User Complaints</h2>
                            <p className="text-sm text-gray-500 mt-1">Total {complaintCounts.total} complaints submitted</p>
                        </div>
                    </div>

                    {complaints.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No complaints found</p>
                            <p className="text-gray-400 text-sm mt-2">This user hasn't submitted any complaints yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {complaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {complaint.device_name} - {complaint.model_number}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                                                        {complaint.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p><span className="font-medium">Year:</span> {complaint.year_of_purchase}</p>
                                                    <p><span className="font-medium">Phone:</span> {complaint.phone}</p>
                                                    <p><span className="font-medium">Address:</span> {complaint.address}</p>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>Submitted: {formatDate(complaint.created_at)}</p>
                                                {complaint.updated_at !== complaint.created_at && (
                                                    <p>Updated: {formatDate(complaint.updated_at)}</p>
                                                )}
                                            </div>
                                        </div>

                                        {complaint.details && (
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 mb-2">Details:</h4>
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{complaint.details}</p>
                                            </div>
                                        )}

                                        {complaint.attachments && complaint.attachments.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 mb-2">Attachments ({complaint.attachments.length}):</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {complaint.attachments.map((url, index) => (
                                                        <a
                                                            key={index}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors"
                                                        >
                                                            📎 Attachment {index + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {complaint.admin_notes && (
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 mb-2">Admin Notes:</h4>
                                                <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">{complaint.admin_notes}</p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                Complaint ID: {complaint.id.slice(0, 8)}...
                                            </div>
                                            <button
                                                onClick={() => confirmDelete(complaint.id)}
                                                disabled={isDeleting}
                                                className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                                aria-label="Delete complaint"
                                            >
                                                <FaTrash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="p-4 sm:p-6 lg:p-8">
                {/* <div className="mb-6">
                    <Button onClick={handleBack} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to User List
                    </Button>
                </div> */}


                <div className=" mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Details</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage user details</p>
                </div>

                <div className="mb-6">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link
                            href="/vendor/adminpanel/userlist"
                            className="hover:text-gray-900 transition-colors"
                        >
                            User List
                        </Link>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">User Details</span>
                    </nav>
                </div>



                <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                    <div className="p-6 border-b bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 ">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-medium">
                                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-white">{user?.name || 'Unnamed User'}</h1>
                                <div className="flex items-center justify-center sm:justify-start mt-1 gap-2">
                                    <p className="text-gray-200 flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {user?.role || 'user'}
                                    </p>
                                    
                                    {/* Role Management Dropdown - Only visible to superadmins */}
                                    {currentAdminRole === 'superadmin' && (
                                        <div className="relative" ref={roleDropdownRef}>
                                            <button
                                                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                                                disabled={updatingRole}
                                                className="ml-2 flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white transition-colors"
                                            >
                                                {updatingRole ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    <>
                                                        Manage Role
                                                        <ChevronDown className="h-4 w-4 ml-1" />
                                                    </>
                                                )}
                                            </button>
                                            
                                            {roleDropdownOpen && (
                                                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800">
                                                    {['user', 'superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'].map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => initiateRoleChange(role)}
                                                            disabled={updatingRole}
                                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${user?.role === role ? 'bg-gray-100 font-medium' : ''}`}
                                                        >
                                                            {role}
                                                            {user?.role === role && (
                                                                <Check className="inline h-4 w-4 ml-2 text-green-500" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.is_email_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user?.is_email_verified ? 'Email Verified' : 'Email Not Verified'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.is_phone_verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user?.is_phone_verified ? 'Phone Verified' : 'Phone Not Verified'}
                                    </span>
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                                        <p className="text-base text-gray-900 mt-1">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                        <p className="text-base text-gray-900 mt-1">{user?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Account Created</p>
                                        <p className="text-base text-gray-900 mt-1">{formatDate(user?.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                        <p className="text-base text-gray-900 mt-1">{formatDate(user?.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">User Complaints</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total Complaints */}
                            <div
                                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => scrollToSection('complaints-section')}
                            >
                                <div className="flex items-start">
                                    <MessageSquare className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Complaints</p>
                                        <p className="text-2xl font-semibold text-red-600 mt-1">{complaintCounts.total}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Complaint Status Breakdown */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <FileText className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Status Breakdown</p>
                                        <div className="flex gap-4 mt-2">
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-yellow-600">{complaints.filter(c => c.status === 'pending').length}</div>
                                                <div className="text-xs text-gray-500">Pending</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-blue-600">{complaints.filter(c => c.status === 'in_progress').length}</div>
                                                <div className="text-xs text-gray-500">In Progress</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-green-600">{complaints.filter(c => c.status === 'resolved').length}</div>
                                                <div className="text-xs text-gray-500">Resolved</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-gray-600">{complaints.filter(c => c.status === 'closed').length}</div>
                                                <div className="text-xs text-gray-500">Closed</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                        
                        {/* Replace the existing user posts section with the new renderComplaintsSection function */}
                        {renderComplaintsSection()}
                    </div>

                    <div className="m-6 border-t border-gray-200 pt-6">
                        <Button onClick={handleBack} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to User List
                        </Button>
                    </div>


                </div>
            </main>
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    isOpen={true}
                    onClose={() => setShowDeleteModal(null)}
                    onConfirm={handleDeleteConfirmed}
                />
            )}

            {/* Role Change Confirmation Modal */}
            {showRoleModal && (
                <RoleConfirmationModal
                    isOpen={true}
                    onClose={() => setShowRoleModal(null)}
                    onConfirm={handleRoleChange}
                    oldRole={showRoleModal.oldRole}
                    newRole={showRoleModal.newRole}
                />
            )}

            {/* Success Modal */}
            <SuccessModal 
                isOpen={showSuccessModal} 
                onClose={() => setShowSuccessModal(false)} 
            />
        </div>
    );
}
 