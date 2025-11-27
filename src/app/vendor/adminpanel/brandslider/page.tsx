/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Loader2, Image as ImageIcon, Search, StarIcon, Award } from 'lucide-react';
import Image from 'next/image';
import Loader from '../components/Loader';

// Define interfaces
interface BrandSlider {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  users?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

const BrandSliderPage = () => {
  // State variables
  const [brandSliders, setBrandSliders] = useState<BrandSlider[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedBrandSlider, setSelectedBrandSlider] = useState<BrandSlider | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageBase64: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch brand sliders on component mount
  useEffect(() => {
    fetchBrandSliders();
  }, []);

  // Fetch brand sliders from API
  const fetchBrandSliders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/brandslider');
      
      if (!response.ok) {
        throw new Error('Failed to fetch brand sliders');
      }
      
      const data = await response.json();
      setBrandSliders(data.brandSliders || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching brand sliders');
      console.error('Error fetching brand sliders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({
        ...formData,
        imageBase64: base64String,
      });
      setPreviewImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Open modal for creating new brand slider
  const openCreateModal = () => {
    setSelectedBrandSlider(null);
    setFormData({
      title: '',
      description: '',
      imageBase64: '',
    });
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  // Open modal for editing existing brand slider
  const openEditModal = (brandSlider: BrandSlider) => {
    setSelectedBrandSlider(brandSlider);
    setFormData({
      title: brandSlider.title,
      description: brandSlider.description || '',
      imageBase64: '', // Don't set image data for existing images
    });
    setPreviewImage(brandSlider.image_url);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (brandSlider: BrandSlider) => {
    setSelectedBrandSlider(brandSlider);
    setIsDeleteModalOpen(true);
  };

  // Close all modals
  const closeModals = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedBrandSlider(null);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.title) {
        alert('Title is required');
        return;
      }
      
      if (!selectedBrandSlider && !formData.imageBase64) {
        alert('Image is required');
        return;
      }
      
      let url = selectedBrandSlider 
        ? `/api/admin/brandslider/update/${selectedBrandSlider.id}` 
        : '/api/admin/brandslider/create';
      
      let method = selectedBrandSlider ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save brand slider');
      }
      
      // Refresh brand sliders list
      await fetchBrandSliders();
      closeModals();
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving brand slider');
      console.error('Error saving brand slider:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!selectedBrandSlider) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/brandslider/delete/${selectedBrandSlider.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete brand slider');
      }
      
      // Refresh brand sliders list
      await fetchBrandSliders();
      closeModals();
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting brand slider');
      console.error('Error deleting brand slider:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter brand sliders based on search term
  const filteredBrandSliders = brandSliders.filter(slider => 
    slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (slider.description && slider.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleBadgeColor = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'superadmin':
        return 'bg-amber-100 text-amber-800';
      case 'rentaladmin':
        return 'bg-green-100 text-green-800';
      case 'eventadmin':
        return 'bg-purple-100 text-purple-800';
      case 'ecomadmin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
     
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-8 p-5 rounded-lg shadow-sm bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      {/* Title section with icon */}
      <div className="flex items-start space-x-3 bg-white/10 rounded-lg p-2 pr-8">
        <div className="p-2 bg-gray-50 rounded-lg border border-white/20 flex items-center justify-center mt-1">
          <Award className="h-8 w-8 text-gray-900" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">Brand Slider Management</h3>
          <p className="text-sm text-white/80">
            {filteredBrandSliders.length} {filteredBrandSliders.length === 1 ? 'brand' : 'brands'} found
          </p>
        </div>
      </div>

      {/* Search and Add Brand section */}
      <div className="w-full md:w-auto md:min-w-[320px] space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 bg-white/95 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openCreateModal}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus size={18} className="mr-2" />
            Add New Brand
          </button>
        </div>
      </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

     

    

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <Loader text="Loading brand sliders..." />
        ) : filteredBrandSliders.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No brand sliders found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Create your first brand slider to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-2" />
                Add New Brand
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrandSliders.map((brandSlider) => (
                  <tr key={brandSlider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                        <Image
                          src={brandSlider.image_url}
                          alt={brandSlider.title}
                          fill
                          className="object-cover"
                          onError={() => {
                            console.error(`Failed to load image for ${brandSlider.title}`);
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{brandSlider.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {brandSlider.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {brandSlider.users?.name || 'Unknown'}
                      </div>
                      {brandSlider.users?.email && (
                        <div className="text-xs text-gray-500">
                          {brandSlider.users.email}
                        </div>
                      )}
                      {brandSlider.users?.role && (
                        <div className="mt-1">
                          {/* <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(brandSlider.users.role)}`}>
                            {brandSlider.users.role}
                          </span> */}

                          <span className="flex items-baseline gap-2">
                            <div className={`w-2 h-2 rounded-full mt-0.5 ${brandSlider.users.role === 'superadmin' ? 'bg-amber-500' : brandSlider.users.role === 'rentaladmin' ? 'bg-green-500' : brandSlider.users.role === 'eventadmin' ? 'bg-purple-500' : brandSlider.users.role === 'ecomadmin' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                            <span className="text-xs text-gray-500 truncate whitespace-nowrap">{brandSlider.users.role}</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(brandSlider.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => openEditModal(brandSlider)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center gap-2 px-2 py-1 rounded-md"
                          title="Edit brand"
                        >
                          <Edit size={18} /> Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(brandSlider)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center gap-2 px-2 py-1 rounded-md"
                          title="Delete brand"
                        >
                          <Trash2 size={18} /> Delete 
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedBrandSlider ? 'Edit Brand Slider' : 'Create Brand Slider'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    required
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Enter brand description (optional)"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image {!selectedBrandSlider && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {previewImage ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          fill
                          className="object-cover"
                          onError={() => {
                            console.error('Failed to load preview image');
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setFormData({
                              ...formData,
                              imageBase64: '',
                            });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 text-center">
                        <ImageIcon size={32} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">No image selected</span>
                      </div>
                    )}
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {selectedBrandSlider ? 'Change Image' : 'Upload Image'}
                      </label>
                      <div className="text-xs text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Supported formats: JPG, PNG, GIF
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        Max size: 5MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm flex items-center justify-center min-w-[100px] transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      {selectedBrandSlider ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedBrandSlider ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBrandSlider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Brand Slider</h3>
              <p className="text-gray-600 leading-relaxed">
                Are you sure you want to delete "{selectedBrandSlider.title}"? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={closeModals}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 shadow-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 active:bg-red-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl flex items-center justify-center min-w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandSliderPage; 