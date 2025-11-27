/* eslint-disable */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Complaint {
  id: string;
  customer_name: string;
  phone: string;
  device_type: string;
  device_brand?: string;
  device_model?: string;
  services?: string[];
  details?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

export default function QueryStatusPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/user/auth/login');
      return;
    }
    fetchComplaints();
  }, [isAuthenticated, user]);

  const fetchComplaints = async () => {
    if (!user?.email) return;
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load your queries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'in_progress':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'resolved':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'closed':
        return 'bg-gray-200 text-gray-800 border-gray-400';
      case 'cancelled':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'pending':
        return <ClockIcon className={iconClass} />;
      case 'in_progress':
        return <ArrowPathIcon className={iconClass} />;
      case 'resolved':
        return <CheckCircleIcon className={iconClass} />;
      case 'closed':
        return <DocumentIcon className={iconClass} />;
      case 'cancelled':
        return <XCircleIcon className={iconClass} />;
      default:
        return <DocumentIcon className={iconClass} />;
    }
  };

  const handleCancelRequest = async (complaintId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'cancelled' })
        .eq('id', complaintId);
      
      if (error) throw error;
      fetchComplaints();
    } catch (err) {
      console.error('Error cancelling request:', err);
      setError('Failed to cancel request. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <ChartBarIcon className="w-8 h-8" />
                Query Status Dashboard
              </h1>
              <p className="text-sky-100 mt-2 text-lg">Monitor and track your submitted service requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200">

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="p-8">
            {complaints.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-sky-100 rounded-full flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-12 h-12 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No queries found</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't submitted any service requests yet. Get started by submitting your first query.</p>
                <button
                  onClick={() => router.push('/user/complaint')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-lg shadow-lg hover:from-sky-600 hover:to-sky-700 transform hover:scale-105 transition-all duration-200"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Submit Your First Query
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Your Service Requests ({complaints.length})</h2>
                  <button
                    onClick={() => router.push('/user/complaint')}
                    className="inline-flex items-center px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-colors duration-200"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Query
                  </button>
                </div>
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-sky-200 transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                            <WrenchScrewdriverIcon className="w-6 h-6 text-sky-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {complaint.device_type}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {complaint.device_brand && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{complaint.device_brand}</span>
                              )}
                              {complaint.device_model && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{complaint.device_model}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <UserIcon className="w-4 h-4" /> Customer
                              </p>
                              <p className="text-gray-900 font-medium">{complaint.customer_name}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" /> Phone
                              </p>
                              <p className="text-gray-900 font-medium">{complaint.phone}</p>
                            </div>
                            {complaint.services && complaint.services.length > 0 && (
                              <div className="md:col-span-2 space-y-2">
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <WrenchScrewdriverIcon className="w-4 h-4" /> Services Required
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {complaint.services.map((service, index) => (
                                    <span key={index} className="px-3 py-1 bg-sky-100 text-sky-800 text-sm rounded-full font-medium">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {complaint.details && (
                              <div className="md:col-span-2 space-y-2">
                                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                  <DocumentIcon className="w-4 h-4" /> Details
                                </p>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{complaint.details}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <strong>Submitted:</strong> {formatDate(complaint.created_at)}
                            </span>
                            {complaint.assigned_to && (
                              <span className="flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4" />
                                <strong>Assigned to:</strong> {complaint.assigned_to}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col items-end gap-3">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(complaint.status)} shadow-sm`}>
                          <span className="mr-2">{getStatusIcon(complaint.status)}</span>
                          <span className="capitalize">{complaint.status.replace('_', ' ')}</span>
                        </div>
                        
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => handleCancelRequest(complaint.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-300 hover:border-red-600 rounded-lg transition-all duration-200"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-sky-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-6 h-6" /> Status Guide
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-100">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor('pending')} mb-3`}>
                  <span className="mr-2">{getStatusIcon('pending')}</span>
                  <span>Pending</span>
                </span>
                <p className="text-sm text-gray-600 font-medium">Awaiting review</p>
              </div>
              <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-100">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor('in_progress')} mb-3`}>
                  <span className="mr-2">{getStatusIcon('in_progress')}</span>
                  <span>In Progress</span>
                </span>
                <p className="text-sm text-gray-600 font-medium">Being worked on</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor('resolved')} mb-3`}>
                  <span className="mr-2">{getStatusIcon('resolved')}</span>
                  <span>Resolved</span>
                </span>
                <p className="text-sm text-gray-600 font-medium">Issue fixed</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor('closed')} mb-3`}>
                  <span className="mr-2">{getStatusIcon('closed')}</span>
                  <span>Closed</span>
                </span>
                <p className="text-sm text-gray-600 font-medium">Case closed</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor('cancelled')} mb-3`}>
                  <span className="mr-2">{getStatusIcon('cancelled')}</span>
                  <span>Cancelled</span>
                </span>
                <p className="text-sm text-gray-600 font-medium">Request cancelled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}