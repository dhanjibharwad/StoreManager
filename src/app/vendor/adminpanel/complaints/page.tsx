/* eslint-disable */

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Complaint {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  source: string | null;
  referred_by: string | null;
  service_type: string | null;
  job_type: string | null;
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
  assigned_to: string | null;
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  service_charge: number | null;
  technician_name?: string;
  accepted_by_name?: string;
}

interface Technician {
  id: string;
  name: string;
  email: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Complaint>>({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'technician' });

  // Fetch complaints and technicians
  useEffect(() => {
    fetchComplaints();
    fetchTechnicians();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching complaints:", error.message);
      setLoading(false);
      return;
    }

    // Fetch technician names separately
    const complaintsWithTechNames = await Promise.all(
      (data || []).map(async (complaint) => {
        let technician_name = null;
        let accepted_by_name = null;
        
        if (complaint.assigned_to) {
          const { data: userData } = await supabase
            .from("users")
            .select("name")
            .eq("id", complaint.assigned_to)
            .single();
          technician_name = userData?.name || null;
        }
        
        if (complaint.accepted_by) {
          const { data: acceptedByData } = await supabase
            .from("users")
            .select("name")
            .eq("id", complaint.accepted_by)
            .single();
          accepted_by_name = acceptedByData?.name || null;
        }
          
        return {
          ...complaint,
          technician_name,
          accepted_by_name,
        };
      })
    );

    setComplaints(complaintsWithTechNames);
    setLoading(false);
  };

  const fetchTechnicians = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("role", "technician");

    if (error) {
      console.error("Error fetching technicians:", error.message);
    } else {
      setTechnicians(data || []);
    }
  };

  const handleAssignTechnician = async (complaintId: string, technicianId: string) => {
    setUpdating(complaintId);

    const updateData: any = {
      assigned_to: technicianId || null,
    };

    // Auto-update status based on assignment
    if (technicianId) {
      updateData.status = "in_progress";
    } else {
      updateData.status = "pending";
    }

    const { error } = await supabase
      .from("complaints")
      .update(updateData)
      .eq("id", complaintId);

    if (error) {
      console.error("Error assigning technician:", error.message);
    } else {
      fetchComplaints();
    }

    setUpdating(null);
  };

  const updateAdminNotes = async (complaintId: string, notes: string) => {
    setUpdating(complaintId);

    const { error } = await supabase
      .from("complaints")
      .update({ admin_notes: notes })
      .eq("id", complaintId);

    if (error) {
      console.error("Error updating notes:", error.message);
    } else {
      fetchComplaints();
    }

    setUpdating(null);
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setUpdating(complaintId);

    const { error } = await supabase
      .from("complaints")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", complaintId);

    if (error) {
      console.error("Error updating status:", error.message);
    } else {
      fetchComplaints();
    }

    setUpdating(null);
  };

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const openComplaintModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminNotes(complaint.admin_notes || "");
    setEditData(complaint);
    setEditMode(false);
  };

  const updateComplaint = async (complaintId: string, updates: Partial<Complaint>) => {
    setUpdating(complaintId);
    
    // Remove computed fields that don't exist in database
    const { technician_name, accepted_by_name, ...dbUpdates } = updates;
    
    const { error } = await supabase
      .from("complaints")
      .update(dbUpdates)
      .eq("id", complaintId);
    
    if (error) {
      console.error("Error updating complaint:", error.message);
    } else {
      fetchComplaints();
      setSelectedComplaint(prev => prev ? { ...prev, ...updates } : null);
    }
    setUpdating(null);
  };

  const createUser = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
    });
    
    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        });
      
      if (!profileError) {
        setNewUser({ name: '', email: '', password: '', role: 'technician' });
        setShowCreateUser(false);
        fetchTechnicians();
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin - Complaints</h1>
        {/* <button
          onClick={() => setShowCreateUser(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create User
        </button> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{complaint.customer_name}</h3>
                    <p className="text-gray-600 text-sm">{complaint.email} • {complaint.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={complaint.status}
                      onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                      disabled={updating === complaint.id}
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Device:</span>
                    <p>{complaint.device_type}</p>
                    {complaint.device_brand && <p>{complaint.device_brand} {complaint.device_model}</p>}
                  </div>
                  <div>
                    <span className="font-medium">Service:</span>
                    <p>{complaint.service_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Assigned To:</span>
                    <select
                      value={complaint.assigned_to || ""}
                      onChange={(e) => handleAssignTechnician(complaint.id, e.target.value)}
                      disabled={updating === complaint.id}
                      className="text-xs border rounded px-1 py-0.5 bg-white"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name}
                        </option>
                      ))}
                    </select>
                    {complaint.technician_name && (
                      <p className="text-xs text-green-600 mt-1">{complaint.technician_name}</p>
                    )}
                    {complaint.accepted_by_name && complaint.accepted_at && (
                      <p className="text-s text-blue-600 mt-1">
                        ✓ Accepted by {complaint.accepted_by_name}
                        <br />
                        <span className="text-gray-500">{new Date(complaint.accepted_at).toLocaleString()}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p>{new Date(complaint.created_at).toLocaleDateString()}</p>
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
                
                {complaint.attachments && complaint.attachments.length > 0 && (
                  <div className="mb-3">
                    <span className="font-medium text-sm">Attachments:</span>
                    <p className="text-xs text-blue-600">{complaint.attachments.length} file(s)</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => openComplaintModal(complaint)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 cursor-pointer"
                  >
                    View Details
                  </button>
                  <span className="text-xs text-gray-500">
                    Updated: {new Date(complaint.updated_at).toLocaleDateString()}
                  </span>
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        {editMode ? 'Cancel Edit' : 'Edit'}
                      </button>
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        {editMode ? (
                          <>
                            <div><span className="font-medium">Customer:</span>
                              <input value={editData.customer_name || ''} onChange={(e) => setEditData({...editData, customer_name: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                            <div><span className="font-medium">Email:</span>
                              <input value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                            <div><span className="font-medium">Phone:</span>
                              <input value={editData.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                            <div><span className="font-medium">Address:</span>
                              <input value={editData.address || ''} onChange={(e) => setEditData({...editData, address: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                            <div><span className="font-medium">Service Type:</span>
                              <input value={editData.service_type || ''} onChange={(e) => setEditData({...editData, service_type: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                          </>
                        ) : (
                          <>
                            <p><span className="font-medium">Customer:</span> {selectedComplaint.customer_name}</p>
                            <p><span className="font-medium">Email:</span> {selectedComplaint.email}</p>
                            <p><span className="font-medium">Phone:</span> {selectedComplaint.phone}</p>
                            <p><span className="font-medium">Address:</span> {selectedComplaint.address}</p>
                            {selectedComplaint.source && <p><span className="font-medium">Source:</span> {selectedComplaint.source}</p>}
                            {selectedComplaint.referred_by && <p><span className="font-medium">Required For:</span> {selectedComplaint.referred_by}</p>}
                            {selectedComplaint.service_type && <p><span className="font-medium">Service Type:</span> {selectedComplaint.service_type}</p>}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Device Information */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Device Information</h4>
                      <div className="space-y-2 text-sm">
                        {editMode ? (
                          <>
                            <div><span className="font-medium">Type:</span>
                              <input value={editData.device_type || ''} onChange={(e) => setEditData({...editData, device_type: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                            <div><span className="font-medium">Brand:</span>
                              <input value={editData.device_brand || ''} onChange={(e) => setEditData({...editData, device_brand: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                            <div><span className="font-medium">Model:</span>
                              <input value={editData.device_model || ''} onChange={(e) => setEditData({...editData, device_model: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                            <div><span className="font-medium">Serial:</span>
                              <input value={editData.serial_number || ''} onChange={(e) => setEditData({...editData, serial_number: e.target.value})} className="ml-2 border rounded px-2 py-1" />
                            </div>
                          </>
                        ) : (
                          <>
                            <p><span className="font-medium">Type:</span> {selectedComplaint.device_type}</p>
                            {selectedComplaint.device_brand && <p><span className="font-medium">Brand:</span> {selectedComplaint.device_brand}</p>}
                            {selectedComplaint.device_model && <p><span className="font-medium">Model:</span> {selectedComplaint.device_model}</p>}
                            {selectedComplaint.serial_number && <p><span className="font-medium">Serial:</span> {selectedComplaint.serial_number}</p>}
                            {selectedComplaint.year_of_purchase && <p><span className="font-medium">Year:</span> {selectedComplaint.year_of_purchase}</p>}
                            {selectedComplaint.accessories && selectedComplaint.accessories.length > 0 && (
                              <p><span className="font-medium">Accessories:</span> {selectedComplaint.accessories.join(', ')}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Services and Configuration */}
                  {(selectedComplaint.services || selectedComplaint.hardware_configuration) && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-semibold text-gray-800">Service Information</h4>
                      {selectedComplaint.services && selectedComplaint.services.length > 0 && (
                        <div>
                          <span className="font-medium text-sm">Services Required:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedComplaint.services.map((service, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedComplaint.hardware_configuration && (
                        <div>
                          <span className="font-medium text-sm">Hardware Configuration:</span>
                          <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedComplaint.hardware_configuration}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Details */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Additional Details</h4>
                    {editMode ? (
                      <textarea
                        value={editData.details || ''}
                        onChange={(e) => setEditData({...editData, details: e.target.value})}
                        className="w-full p-3 border rounded-lg"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm bg-gray-50 p-3 rounded">{selectedComplaint.details}</p>
                    )}
                  </div>
                  
                  {/* Service Charge */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Service Charge</h4>
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.service_charge || 0}
                        onChange={(e) => setEditData({...editData, service_charge: parseFloat(e.target.value) || 0})}
                        className="border rounded px-3 py-2"
                        placeholder="Enter service charge"
                      />
                    ) : (
                      <p className="text-lg font-medium text-green-600">
                         ₹ {selectedComplaint.service_charge || 0}
                      </p>
                    )}
                  </div>
                  
                  {/* Assign Technician */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Assign Technician</h4>
                    <select
                      value={editData.assigned_to || ''}
                      onChange={(e) => {
                        setEditData({...editData, assigned_to: e.target.value});
                        if (!editMode) updateComplaint(selectedComplaint.id, {assigned_to: e.target.value});
                      }}
                      className="border rounded px-3 py-2"
                    >
                      <option value="">Select Technician</option>
                      {technicians.map((tech) => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                      ))}
                    </select>
                  </div>
                  
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
                            📎 Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Admin Notes */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-2">Admin Notes</h4>
                    <textarea
                      value={editMode ? (editData.admin_notes || '') : adminNotes}
                      onChange={(e) => editMode ? setEditData({...editData, admin_notes: e.target.value}) : setAdminNotes(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                      rows={3}
                      placeholder="Add admin notes..."
                    />
                    {editMode ? (
                      <button
                        onClick={() => {
                          updateComplaint(selectedComplaint.id, editData);
                          setEditMode(false);
                        }}
                        disabled={updating === selectedComplaint.id}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating === selectedComplaint.id ? 'Saving...' : 'Save All Changes'}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateAdminNotes(selectedComplaint.id, adminNotes)}
                        disabled={updating === selectedComplaint.id}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating === selectedComplaint.id ? 'Saving...' : 'Save Notes'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Create User Modal */}
          {showCreateUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Create New User</h3>
                  <button onClick={() => setShowCreateUser(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                  <button
                    onClick={createUser}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                  >
                    Create User
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
