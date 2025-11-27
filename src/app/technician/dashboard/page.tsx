/* eslint-disable */

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  CalendarIcon,
  XMarkIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

interface Complaint {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  source: string | null;
  referred_by: string | null;
  service_type: string | null;
  device_type: string;
  device_brand: string | null;
  device_model: string | null;
  serial_number: string | null;
  accessories: string[] | null;
  device_password: string | null;
  year_of_purchase: number | null;
  services: string[] | null;
  hardware_configuration: string | null;
  details: string | null;
  attachments: string[] | null;
  status: string;
  admin_notes: string | null;
  service_charge: number | null;
  created_at: string;
  updated_at: string;
}

export default function TechnicianComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [remarks, setRemarks] = useState("");
  const [serviceCharge, setServiceCharge] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("assigned_to", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching complaints:", error.message);
    } else {
      setComplaints(data || []);
    }
    setLoading(false);
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setUpdating(complaintId);

    const updateData: any = { 
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // If accepting work, add acceptance info
    if (newStatus === 'in_progress' && user) {
      updateData.accepted_at = new Date().toISOString();
      updateData.accepted_by = user.id;
    }

    const { error } = await supabase
      .from("complaints")
      .update(updateData)
      .eq("id", complaintId);

    if (error) {
      console.error("Error updating status:", error.message);
    } else {
      fetchComplaints();
    }

    setUpdating(null);
  };

  const updateRemarks = async (complaintId: string, newRemarks: string) => {
    setUpdating(complaintId);

    const { error } = await supabase
      .from("complaints")
      .update({ admin_notes: newRemarks })
      .eq("id", complaintId);

    if (error) {
      console.error("Error updating remarks:", error.message);
    } else {
      fetchComplaints();
    }

    setUpdating(null);
  };

  const updateServiceCharge = async (complaintId: string, charge: number) => {
    setUpdating(complaintId);

    const { error } = await supabase
      .from("complaints")
      .update({ service_charge: charge })
      .eq("id", complaintId);

    if (error) {
      console.error("Error updating service charge:", error.message);
    } else {
      fetchComplaints();
    }

    setUpdating(null);
  };

  const openComplaintModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setRemarks(complaint.admin_notes || "");
    setServiceCharge(complaint.service_charge || 0);
  };

  if (!user) {
    return <div className="p-6">Please log in to access the technician dashboard.</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-sky-600 to-sky-600 rounded-xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">My Assigned Tasks</h1>
          <p className="text-blue-100">Welcome back, {user.name || user.email}</p>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>Pending: {complaints.filter(c => c.status === 'pending').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>In Progress: {complaints.filter(c => c.status === 'in_progress').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Resolved: {complaints.filter(c => c.status === 'resolved').length}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks assigned to you yet.
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white border rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-gray-800">{complaint.customer_name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        ID: {complaint.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4" /> {complaint.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" /> {complaint.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4" /> {complaint.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-2 rounded-full text-sm font-semibold ${
                        complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {complaint.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                          disabled={updating === complaint.id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {updating === complaint.id ? 'Accepting...' : 'Accept Work'}
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="font-medium text-gray-700">Device</p>
                        <p className="text-gray-900">{complaint.device_type}</p>
                        {complaint.device_brand && <p className="text-gray-600">{complaint.device_brand} {complaint.device_model}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CogIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="font-medium text-gray-700">Service Type</p>
                        <p className="text-gray-900">{complaint.service_type || 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <CalendarIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="font-medium text-gray-700">Priority</p>
                        <p className="text-gray-900">Normal</p>
                      </div>
                    </div>
                  </div>
                </div>

                {complaint.services && complaint.services.length > 0 && (
                  <div className="mb-3">
                    <span className="font-medium text-sm">Services Required:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {complaint.services.map((service, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={() => openComplaintModal(complaint)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    View Full Details
                  </button>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Complaint Details Modal */}
          {selectedComplaint && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedComplaint(null)}
            >
              <div 
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">Service Request Details</h3>
                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedComplaint.customer_name}</p>
                        <p><span className="font-medium">Email:</span> {selectedComplaint.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedComplaint.phone}</p>
                        <p><span className="font-medium">Address:</span> {selectedComplaint.address}</p>
                        {selectedComplaint.service_type && <p><span className="font-medium">Service Type:</span> {selectedComplaint.service_type}</p>}
                      </div>
                    </div>

                    {/* Device Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Device Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Type:</span> {selectedComplaint.device_type}</p>
                        {selectedComplaint.device_brand && <p><span className="font-medium">Brand:</span> {selectedComplaint.device_brand}</p>}
                        {selectedComplaint.device_model && <p><span className="font-medium">Model:</span> {selectedComplaint.device_model}</p>}
                        {selectedComplaint.serial_number && <p><span className="font-medium">Serial:</span> {selectedComplaint.serial_number}</p>}
                        {selectedComplaint.year_of_purchase && <p><span className="font-medium">Year:</span> {selectedComplaint.year_of_purchase}</p>}
                        {selectedComplaint.accessories && selectedComplaint.accessories.length > 0 && (
                          <p><span className="font-medium">Accessories:</span> {selectedComplaint.accessories.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services Required */}
                  {selectedComplaint.services && selectedComplaint.services.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Services Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedComplaint.services.map((service, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hardware Configuration */}
                  {selectedComplaint.hardware_configuration && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Hardware Configuration</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedComplaint.hardware_configuration}</p>
                    </div>
                  )}

                  {/* Problem Details */}
                  {selectedComplaint.details && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Problem Details</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedComplaint.details}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Attachments</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedComplaint.attachments.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 border rounded hover:bg-gray-50 text-sm text-blue-600"
                          >
                            <PaperClipIcon className="w-4 h-4 inline mr-1" /> Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Update */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Update Status</h4>
                    <div className="flex items-center gap-4">
                      <select
                        value={selectedComplaint.status}
                        onChange={(e) => {
                          handleStatusChange(selectedComplaint.id, e.target.value);
                          setSelectedComplaint(prev => prev ? {...prev, status: e.target.value} : null);
                        }}
                        disabled={updating === selectedComplaint.id}
                        className="border rounded px-3 py-2 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      {selectedComplaint.status === 'pending' && (
                        <button
                          onClick={() => {
                            handleStatusChange(selectedComplaint.id, 'in_progress');
                            setSelectedComplaint(prev => prev ? {...prev, status: 'in_progress'} : null);
                          }}
                          disabled={updating === selectedComplaint.id}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {updating === selectedComplaint.id ? 'Accepting...' : 'Accept Work'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Service Charge */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Service Charge</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <span className="text-lg font-medium mr-2">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={serviceCharge}
                          onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                          className="border rounded px-3 py-2 w-32"
                          placeholder="0.00"
                        />
                      </div>
                      <button
                        onClick={() => {
                          updateServiceCharge(selectedComplaint.id, serviceCharge);
                          setSelectedComplaint(prev => prev ? {...prev, service_charge: serviceCharge} : null);
                        }}
                        disabled={updating === selectedComplaint.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating === selectedComplaint.id ? 'Updating...' : 'Update Charge'}
                      </button>
                    </div>
                  </div>

                  {/* Technician Remarks */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Technician Remarks</h4>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      rows={4}
                      placeholder="Add your remarks about the service..."
                    />
                    <button
                      onClick={() => {
                        updateRemarks(selectedComplaint.id, remarks);
                        setSelectedComplaint(prev => prev ? {...prev, admin_notes: remarks} : null);
                      }}
                      disabled={updating === selectedComplaint.id}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating === selectedComplaint.id ? 'Saving...' : 'Save Remarks'}
                    </button>
                  </div>

                  {/* Admin Notes */}
                  {selectedComplaint.admin_notes && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-800 mb-2">Admin Notes</h4>
                      <p className="text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">{selectedComplaint.admin_notes}</p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="mt-5 pt-4 border-t text-xs text-gray-500">
                    <p>Created: {new Date(selectedComplaint.created_at).toLocaleString()}</p>
                    <p>Last Updated: {new Date(selectedComplaint.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}