/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Complaint {
  id: string;
  email: string;
  phone: string;
  address: string;
  device_name: string;
  model_number: string;
  year_of_purchase: number;
  details: string;
  attachments: string[];
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

interface ComplaintsListProps {
  userOnly?: boolean; // If true, show only current user's complaints
}

export default function ComplaintsList({ userOnly = false }: ComplaintsListProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [userOnly]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (userOnly) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq("user_id", user.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading complaints: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {userOnly ? "My Complaints" : "All Complaints"}
        </h2>
        <button
          onClick={fetchComplaints}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No complaints found.
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {complaint.device_name} - {complaint.model_number}
                  </h3>
                  <p className="text-gray-600 text-sm">{complaint.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  {complaint.status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                {complaint.details}
              </p>
              
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Year: {complaint.year_of_purchase}</span>
                <span>{formatDate(complaint.created_at)}</span>
              </div>
              
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-blue-600">
                    📎 {complaint.attachments.length} attachment(s)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for complaint details */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Complaint Details</h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device</label>
                    <p className="text-sm">{selectedComplaint.device_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <p className="text-sm">{selectedComplaint.model_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm">{selectedComplaint.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm">{selectedComplaint.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year of Purchase</label>
                    <p className="text-sm">{selectedComplaint.year_of_purchase}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedComplaint.status
                      )}`}
                    >
                      {selectedComplaint.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm">{selectedComplaint.address}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Details</label>
                  <p className="text-sm whitespace-pre-wrap">{selectedComplaint.details}</p>
                </div>
                
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedComplaint.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 border rounded hover:bg-gray-50"
                        >
                          <span className="text-sm text-blue-600">
                            📎 Attachment {index + 1}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedComplaint.admin_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <p className="text-sm whitespace-pre-wrap bg-gray-50 p-2 rounded">
                      {selectedComplaint.admin_notes}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 pt-4 border-t">
                  <p>Created: {formatDate(selectedComplaint.created_at)}</p>
                  <p>Updated: {formatDate(selectedComplaint.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}