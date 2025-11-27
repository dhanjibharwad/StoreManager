/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Loader from "../../components/Loader";

interface Technician {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  status?: string;
}

interface Complaint {
  id: string;
  customer_name: string;
  status: string;
  created_at: string;
  service_type?: string;
}

export default function TechnicianDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  const technicianId = params.id as string;

  useEffect(() => {
    if (technicianId) {
      fetchTechnician();
      fetchTechnicianComplaints();
    }
  }, [technicianId]);

  const fetchTechnician = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', technicianId)
      .eq('role', 'technician')
      .single();

    if (!error && data) {
      setTechnician(data);
    }
    setLoading(false);
  };

  const fetchTechnicianComplaints = async () => {
    setComplaintsLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('id, customer_name, status, created_at, service_type')
      .eq('assigned_to', technicianId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
    setComplaintsLoading(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Technician Not Found</h2>
          <p className="text-gray-600 mb-4">The technician you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-3 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technicians
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900">Technician Details</h1>
          <p className="text-gray-600">View technician information and assigned tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Technician Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border p-6">
              <div className="text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {technician.name?.charAt(0)?.toUpperCase() || technician.email.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{technician.name || 'Unnamed Technician'}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Technician
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{technician.email}</p>
                    <div className="flex items-center mt-1">
                      {technician.is_email_verified ? (
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${technician.is_email_verified ? 'text-green-600' : 'text-red-600'}`}>
                        {technician.is_email_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{technician.phone || 'Not provided'}</p>
                    {technician.phone && (
                      <div className="flex items-center mt-1">
                        {technician.is_phone_verified ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${technician.is_phone_verified ? 'text-green-600' : 'text-red-600'}`}>
                          {technician.is_phone_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-900">Joined {formatDate(technician.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Tasks</h3>
                <p className="text-sm text-gray-600 mt-1">Tasks assigned to this technician</p>
              </div>

              <div className="p-6">
                {complaintsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tasks assigned yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{complaint.customer_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Service: {complaint.service_type || 'Not specified'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {formatDate(complaint.created_at)}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}