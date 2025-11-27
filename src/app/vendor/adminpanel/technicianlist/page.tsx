/* eslint-disable */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Users, Trash2, Eye, Check, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/authContext';
import Loader from "../components/Loader";

interface Technician {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  created_at: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
}

export default function ViewTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const fetchTechnicians = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'technician')
      .order('created_at', { ascending: false });
    if (!error && data) setTechnicians(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleDeleteConfirmed = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    setShowConfirm(null);
    fetchTechnicians();
  };

  const handleView = (id: string) => {
    router.push(`/vendor/adminpanel/technicianlist/${id}`);
  };

  const filteredTechnicians = technicians.filter(technician => {
    const searchLower = searchTerm.toLowerCase();
    return (
      technician.name?.toLowerCase().includes(searchLower) ||
      technician.email.toLowerCase().includes(searchLower) ||
      technician.phone?.toLowerCase().includes(searchLower)
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Technician Management</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage technicians</p>
          </div>
          <div className="mt-2 sm:mt-0 relative">
            <input
              type="text"
              placeholder="Search technicians..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border">
          <div className="p-4 sm:p-5 border-b">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Technicians</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Total {technicians.length} technicians</p>
              </div>
            </div>
          </div>
          
          <div className="p-0">
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase">Email Verified</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTechnicians.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No technicians found
                        </td>
                      </tr>
                    ) : (
                      filteredTechnicians.map((technician) => (
                        <tr key={technician.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-medium">
                                {technician.name?.charAt(0)?.toUpperCase() || technician.email.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{technician.name || 'Unnamed'}</div>
                                <div className="text-sm text-gray-500">{technician.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">{technician.phone || '-'}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {technician.is_email_verified ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`ml-2 text-xs ${technician.is_email_verified ? 'text-green-600' : 'text-red-600'}`}>
                                {technician.is_email_verified ? 'Verified' : 'Not Verified'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {formatDate(technician.created_at)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(technician.id)}
                                className="flex items-center"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {isSuperAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowConfirm(technician.id)}
                                  className="flex items-center text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
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

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this technician?</p>
              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setShowConfirm(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDeleteConfirmed(showConfirm)}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}