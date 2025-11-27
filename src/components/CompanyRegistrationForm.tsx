/* eslint-disable */

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
}

export default function CompanyRegistrationForm() {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    website: '',
    gst_number: '',
    company_logo_url: '',
    industry: '',
    company_size: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    admin_name: '',
    admin_email: '',
    subscription_plan: ''
  });
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Supabase error:', error);
        // Fallback to hardcoded plans
        setPlans([
          {
            id: 'free',
            name: 'Free',
            description: 'Perfect for getting started',
            price: 0,
            billing_cycle: 'monthly',
            features: ['Up to 3 users', 'Basic features', 'Email support', '500MB storage', 'Standard templates']
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Complete solution for large organizations',
            price: 299.99,
            billing_cycle: 'monthly',
            features: ['Unlimited users', 'All premium features', '24/7 priority support', 'Unlimited storage', 'Custom integrations', 'Advanced analytics', 'Dedicated account manager', 'Custom branding']
          }
        ]);
      } else if (data && data.length > 0) {
        setPlans(data);
      } else {
        // Fallback if no data
        setPlans([
          {
            id: 'free',
            name: 'Free',
            description: 'Perfect for getting started',
            price: 0,
            billing_cycle: 'monthly',
            features: ['Up to 3 users', 'Basic features', 'Email support', '5GB storage', 'Standard templates']
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Complete solution for large organizations',
            price: 299.99,
            billing_cycle: 'monthly',
            features: ['Unlimited users', 'All premium features', '24/7 priority support', 'Unlimited storage', 'Custom integrations', 'Advanced analytics', 'Dedicated account manager', 'Custom branding']
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      // Fallback to hardcoded plans
      setPlans([
        {
          id: 'free',
          name: 'Free',
          description: 'Perfect for getting started',
          price: 0,
          billing_cycle: 'monthly',
          features: ['Up to 3 users', 'Basic features', 'Email support', '5GB storage', 'Standard templates']
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'Complete solution for large organizations',
          price: 299.99,
          billing_cycle: 'monthly',
          features: ['Unlimited users', 'All premium features', '24/7 priority support', 'Unlimited storage', 'Custom integrations', 'Advanced analytics', 'Dedicated account manager', 'Custom branding']
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);



    try {
      const response = await fetch('/api/companies/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.message);
      }
      setFormData({
        company_name: '',
        email: '',
        phone: '',
        website: '',
        gst_number: '',
        company_logo_url: '',
        industry: '',
        company_size: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        admin_name: '',
        admin_email: '',
        subscription_plan: ''
      });
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-sky-50 to-white border border-sky-200 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-sky-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6 text-lg">Your company registration has been submitted. We'll contact you soon to activate your subscription.</p>
          <p className="text-sky-600 mb-8 text-base font-medium">Please check your email and register your email address in our portal to get started.</p>
          <button
            onClick={() => window.location.href = '/user/home'}
            className="bg-sky-400 text-white px-8 py-3 rounded-xl font-semibold hover:bg-sky-500 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Explore Our Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">

        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information and Admin Account - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Information */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
            <span className="bg-sky-100 p-3 rounded-xl mr-4">
              <svg className="w-6 h-6 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
            </span>
            Company Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="company_name"
              placeholder="Company Name *"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="email"
              name="email"
              placeholder="Company Email *"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="url"
              name="website"
              placeholder="Website URL"
              value={formData.website}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="text"
              name="gst_number"
              placeholder="GST Number"
              value={formData.gst_number}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          
          {/* Company Logo - Separate section */}
          {/* <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Company Logo</label>
            <input
              type="file"
              name="company_logo"
              accept="image/*"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-400 file:text-white file:font-medium hover:file:bg-sky-500"
            />
            <p className="text-xs text-gray-500 mt-2">Recommended: 200x200px, PNG or JPG, max 2MB</p>
          </div>
           */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="">Select Industry *</option>
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
            <select
              name="company_size"
              value={formData.company_size}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="">Company Size *</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
          
          <div className="mt-6">
            <textarea
              name="address"
              placeholder="Company Address *"
              value={formData.address}
              onChange={handleChange}
              required
              rows={3}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <input
              type="text"
              name="city"
              placeholder="City *"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="text"
              name="state"
              placeholder="State *"
              value={formData.state}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="text"
              name="country"
              placeholder="Country *"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="text"
              name="postal_code"
              placeholder="Postal Code *"
              value={formData.postal_code}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
            </div>

            {/* Admin Account */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
            <span className="bg-sky-100 p-3 rounded-xl mr-4">
              <svg className="w-6 h-6 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            Admin Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="admin_name"
              placeholder="Admin Name *"
              value={formData.admin_name}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
            <input
              type="email"
              name="admin_email"
              placeholder="Admin Email *"
              value={formData.admin_email}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
          
          {/* Registration Information */}
          <div className="mt-6 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-sky-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Registration Process</h3>
                <p className="text-gray-700 mb-3">
                  <span className="font-medium text-sky-600">Register your email address in our portal</span> to get started with your company account.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Your admin credentials will be sent to the registered email
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Secure login details will be provided after verification
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-3"></div>
                    Complete setup instructions will be included
                  </div>
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>

          {/* Subscription Plans */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col h-full ${
                  formData.subscription_plan === plan.id
                    ? 'border-sky-400 bg-gradient-to-br from-sky-50 to-white shadow-lg scale-105'
                    : 'border-gray-200 hover:border-sky-300 hover:shadow-md'
                } ₹{plan.name === 'Enterprise' ? 'ring-2 ring-sky-100' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, subscription_plan: plan.id }))}
              >
                {plan.name === 'Enterprise' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-sky-400 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                      POPULAR
                    </span>
                  </div>
                )}
                <input
                  type="radio"
                  name="subscription_plan"
                  value={plan.id}
                  checked={formData.subscription_plan === plan.id}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center mb-6">
                  <h3 className="font-bold text-2xl mb-3 text-gray-800">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-sky-400">FREE</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-800">₹{plan.price}</span>
                        <span className="text-gray-500 text-lg">/{plan.billing_cycle}</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-5 h-5 bg-sky-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="text-center mt-auto">
                  <span className={`inline-block px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    formData.subscription_plan === plan.id
                      ? 'bg-sky-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    {formData.subscription_plan === plan.id ? '✓ Selected' : 'Select Plan'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>

          <div className="text-center pt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-400 text-white py-4 px-16 rounded-2xl font-bold text-xl hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Register Company'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}