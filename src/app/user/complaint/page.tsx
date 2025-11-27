/* eslint-disable */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";
import FileUpload from "@/components/FileUpload";

interface FormData {
  // Basic Information
  customerName: string;
  email: string;
  phone: string;
  address: string;
  source: string;
  referredBy: string;
  serviceType: string;
  
  // Device Information
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  serialNumber: string;
  accessories: string[];
  storageLocation: string;
  deviceColor: string;
  devicePassword: string;
  yearOfPurchase: string;
  
  // Service Information
  services: string[];
  tags: string;
  hardwareConfiguration: string;
  serviceAssessment: string;
  
  // Additional Information
  details: string;
}

export default function ComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    // Basic Information
    customerName: "",
    email: "",
    phone: "",
    address: "",
    source: "",
    referredBy: "",
    serviceType: "",
    
    // Device Information
    deviceType: "",
    deviceBrand: "",
    deviceModel: "",
    serialNumber: "",
    accessories: [],
    storageLocation: "",
    deviceColor: "",
    devicePassword: "",
    yearOfPurchase: "",
    
    // Service Information
    services: [],
    tags: "",
    hardwareConfiguration: "",
    serviceAssessment: "",
    
    // Additional Information
    details: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Options for dropdowns
  const sourceOptions: string[] = ["Google", "Referral", "Website", "Social Media"];
  const serviceTypeOptions: string[] = ["Carried By User", "On-Site Service", "Pick & Drop"];
  const deviceTypeOptions: string[] = ["Desktop (PC)", "Laptop", "Mobile", "Tablet", "Printer", "Other"];
  const storageLocationOptions: string[] = ["Shelf 1", "Shelf 2", "Shelf 3", "Warehouse A", "Warehouse B"];
  const deviceColorOptions: string[] = ["Black", "White", "Silver", "Grey", "Blue", "Red", "Other"];

  // Auto-fetch email and customer name from auth when component mounts
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ 
        ...prev, 
        email: user.email,
        customerName: (user as any)?.displayName || user.email.split('@')[0]
      }));
    }
  }, [user]);

  // handle form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // handle array input changes (for accessories and services)
  const handleArrayInputChange = (name: keyof Pick<FormData, 'accessories' | 'services'>, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  // upload files to Supabase storage
  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) {
      console.log('No files to upload');
      return [];
    }
    
    console.log(`Starting upload of ${files.length} files:`, files.map(f => f.name));
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `complaints/${fileName}`;
        
        console.log(`Upload path: ${filePath}`);
        
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) {
          console.error('Upload error:', error);
          throw error;
        }
        
        console.log('Upload successful:', data);
        
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);
        
        console.log('Public URL:', publicUrl);
        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload files: ${(error as Error).message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
    
    return uploadedUrls;
  };

  // handle submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!user) {
      setMessage("You need to log in before submitting a complaint.");
      setLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields: Array<{ field: keyof FormData; message: string }> = [
      { field: 'customerName', message: 'Customer name is required.' },
      { field: 'phone', message: 'Phone number is required.' },
      { field: 'address', message: 'Address is required.' },
      { field: 'deviceType', message: 'Device type is required.' },
    ];

    for (const { field, message: errorMessage } of requiredFields) {
      const fieldValue = formData[field];
      if (!fieldValue || (typeof fieldValue === 'string' && !fieldValue.trim())) {
        setMessage(errorMessage);
        setLoading(false);
        return;
      }
    }

    // Validate year if provided
    if (formData.yearOfPurchase) {
      const currentYear = new Date().getFullYear();
      const purchaseYear = parseInt(formData.yearOfPurchase);
      if (!purchaseYear || purchaseYear < 1900 || purchaseYear > currentYear) {
        setMessage(`Please enter a valid year between 1900 and ${currentYear}.`);
        setLoading(false);
        return;
      }
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      setMessage("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

    try {
      // Check if user exists in database
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userError || !existingUser) {
        setMessage("User account not found. Please log out and log back in.");
        setLoading(false);
        return;
      }

      // Upload files if any
      let fileUrls: string[] = [];
      if (files.length > 0) {
        fileUrls = await uploadFiles();
      }
      
      console.log('Final file URLs for database:', fileUrls);
      
      // Insert complaint with all the new fields
      const { error } = await supabase.from("complaints").insert([
        {
          user_id: user.id,
          
          // Basic Information
          customer_name: formData.customerName.trim(),
          email: formData.email,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          source: formData.source || null,
          referred_by: formData.referredBy.trim() || null,
          service_type: formData.serviceType || null,
          
          // Device Information
          device_type: formData.deviceType,
          device_brand: formData.deviceBrand.trim() || null,
          device_model: formData.deviceModel.trim() || null,
          serial_number: formData.serialNumber.trim() || null,
          accessories: formData.accessories.length > 0 ? formData.accessories : null,
          storage_location: formData.storageLocation || null,
          device_color: formData.deviceColor || null,
          device_password: formData.devicePassword.trim() || null,
          
          // Service Information
          services: formData.services.length > 0 ? formData.services : null,
          tags: formData.tags.trim() || null,
          hardware_configuration: formData.hardwareConfiguration.trim() || null,
          service_assessment: formData.serviceAssessment.trim() || null,
          
          // Additional fields
          year_of_purchase: formData.yearOfPurchase ? parseInt(formData.yearOfPurchase) : null,
          details: formData.details.trim() || null,
          attachments: fileUrls.length > 0 ? fileUrls : null,
        },
      ]);

      if (error) {
        setMessage("Error submitting complaint: " + error.message);
      } else {
        // Store success message in sessionStorage for notification
        sessionStorage.setItem('complaintSuccess', 'Your request has been processed successfully!');
        
        // Redirect to home page
        router.push('/user/home');
      }
    } catch (error) {
      setMessage("Error submitting request: " + (error as Error).message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-center">Service Request Form</h1>
      <p className="text-gray-600 text-center mb-8">Submit your device service request with complete information</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="block font-medium mb-1">Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly
                className="w-full p-3 border rounded-lg bg-gray-100"
                placeholder="Auto-filled from account"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block font-medium mb-1">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter complete address"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select source</option>
                {sourceOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Required For</label>
              <input
                type="text"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Myself, Relative, Friend"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Service Type</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select service type</option>
                {serviceTypeOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* <div>
              <label className="block font-medium mb-1">Job Type *</label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select job type</option>
                {jobTypeOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div> */}
          </div>
        </div>

        {/* Device Information Section */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Device Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="block font-medium mb-1">Device Type *</label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select device type</option>
                {deviceTypeOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Device Brand</label>
              <input
                type="text"
                name="deviceBrand"
                value={formData.deviceBrand}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dell, HP, Apple"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Device Model</label>
              <input
                type="text"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Inspiron 15, MacBook Pro"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Serial / IMEI Number</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter serial number"
              />
            </div>

            {/* <div>
              <label className="block font-medium mb-1">Storage Location</label>
              <select
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select storage location</option>
                {storageLocationOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div> */}

            {/* <div>
              <label className="block font-medium mb-1">Device Color</label>
              <select
                name="deviceColor"
                value={formData.deviceColor}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select device color</option>
                {deviceColorOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div> */}

            <div>
              <label className="block font-medium mb-1">Device Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="devicePassword"
                  value={formData.devicePassword}
                  onChange={handleChange}
                  className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Device access password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Year of Purchase</label>
              <input
                type="number"
                name="yearOfPurchase"
                value={formData.yearOfPurchase}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2020"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block font-medium mb-1">Accessories</label>
              <input
                type="text"
                value={formData.accessories.join(', ')}
                onChange={(e) => handleArrayInputChange('accessories', e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Charger, Mouse, Keyboard (comma-separated)"
              />
            </div>
          </div>
        </div>

        {/* Service Information Section */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Service Information</h2>
          <div className="space-y-4">
            
            <div>
              <label className="block font-medium mb-1">Services Required</label>
              <input
                type="text"
                value={formData.services.join(', ')}
                onChange={(e) => handleArrayInputChange('services', e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Hardware Repair, Software Installation (comma-separated)"
              />
            </div>

            {/* <div>
              <label className="block font-medium mb-1">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4GB RAM, 1TB HDD etc. type name and press enter button to create"
              />
            </div> */}

            <div>
              <label className="block font-medium mb-1">Hardware Configuration</label>
              <textarea
                name="hardwareConfiguration"
                value={formData.hardwareConfiguration}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hardware configuration details (e.g., RAM, HDD, Serial, Motherboard)"
              />
            </div>

            {/* <div>
              <label className="block font-medium mb-1">Service Assessment</label>
              <textarea
                name="serviceAssessment"
                value={formData.serviceAssessment}
                onChange={handleChange}
                rows={4}
                maxLength={50000}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the issue in detail and initial assessment"
              />
              <div className="text-sm text-gray-500 mt-1">
                Max Allowed Characters: 50000 ({formData.serviceAssessment.length}/50000)
              </div>
            </div> */}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h2>
          <div className="space-y-4">
            
            <div>
              <label className="block font-medium mb-1">Other Details</label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information or special instructions"
              />
            </div>

            {/* File Upload */}
            <div>
              <FileUpload
                files={files}
                onFilesChange={setFiles}
                maxFiles={5}
                maxSize={10}
                acceptedTypes={["image/*", "video/*", ".pdf", ".doc", ".docx"]}
                label="Attachments (Images, Videos, Documents)"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg transition-colors"
        >
          {loading ? "Submitting..." : uploading ? "Uploading files..." : "Submit Service Request"}
        </button>
      </form>

      {message && (
        <div className={`mt-6 p-4 rounded-lg text-center ${
          message.includes("successfully") 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}