
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  service_id: string;
}

interface Service {
  id: string;
  name: string;
}

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newService, setNewService] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    const { data: servicesData } = await supabase.from('services').select('*');
    const { data: categoriesData } = await supabase.from('categories').select('*');
    setServices(servicesData || []);
    setCategories(categoriesData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddService = async () => {
    if (!newService) return;
    await supabase.from('services').insert({ name: newService });
    setNewService('');
    fetchData();
  };

  const handleAddCategory = async () => {
    if (!newCategory || !selectedService) return;
    await supabase.from('categories').insert({
      name: newCategory,
      service_id: selectedService,
    });
    setNewCategory('');
    fetchData();
  };

  const handleDeleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchData();
  };

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-800 text-center sm:text-left">
        🛠️ Manage Services & Categories
      </h1>

      {/* Search */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <Input
          placeholder="🔍 Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add Service */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold text-lg">Add New Service Type</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="e.g. Real Estate, Event Hosting"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            className="flex-1"
          />
          <Button className="w-full sm:w-auto" onClick={handleAddService}>
            Add Service
          </Button>
        </div>
      </div>

      {/* Add Category */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold text-lg">Add New Category Under Service</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            className="border rounded px-3 py-2 flex-1"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">Select Service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="e.g. Apartments, Weddings"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1"
          />
          <Button className="w-full sm:w-auto" onClick={handleAddCategory}>
            Add Category
          </Button>
        </div>
      </div>

      {/* List Services & Categories */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-4 text-base sm:text-lg">📋 Current Services & Categories</h2>
        {filteredServices.map((service) => (
          <div key={service.id} className="mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-blue-700 font-medium">{service.name}</h3>
              <Button
                onClick={() => handleDeleteService(service.id)}
                variant="destructive"
                size="sm"
              >
                Delete
              </Button>
            </div>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
              {categories
                .filter((c) => c.service_id === service.id)
                .map((cat) => (
                  <li key={cat.id} className="flex justify-between items-center gap-2">
                    <span className="truncate">{cat.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

