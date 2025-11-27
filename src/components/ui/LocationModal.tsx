/* eslint-disable */

'use client'

import React, { useState } from 'react';

export type UserLocationType = {
  city: string;
  country: string;
} | null;

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  // Enhanced getCurrentLocation function
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError("");

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser");
        return;
      }

      // Get current position with high accuracy options
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // First try Nominatim
            const nominatimResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'RentalApp/1.0'
                }
              }
            );

            const nominatimData = await nominatimResponse.json();
            const address = nominatimData.address;

            // Extract city from various possible fields
            const cityOptions = [
              address.city,
              address.town,
              address.village,
              address.suburb,
              address.municipality,
              address.city_district,
              address.district,
              address.county,
              // Some locations might have the city in the state field
              address.state
            ];

            // Get the first non-empty city value
            const city = cityOptions.find(opt => opt && typeof opt === 'string' && opt.trim().length > 0) || '';

            const location = {
              city: city || "Unknown",
              country: address.country || "Unknown"
            };

            // Store location in localStorage
            localStorage.setItem('userLocation', JSON.stringify(location));
            
            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event('locationUpdated'));
            
            // Close modal
            onClose();
          } catch (error) {
            console.error("Error processing location:", error);
            setLocationError("Error processing your location. Please enter it manually.");
          } finally {
            setIsLoadingLocation(false);
          }
        },
        (error) => {
          // Handle specific geolocation errors without throwing
          setIsLoadingLocation(false);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setLocationError(
                "Location access was denied. Please enter your location manually below or reset permissions in your browser settings (look for the location/GPS icon in your browser&apos;s address bar)."
              );
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information is unavailable. Please enter your location manually.");
              break;
            case error.TIMEOUT:
              setLocationError("The request to get your location timed out. Please enter your location manually.");
              break;
            default:
              setLocationError("An unknown error occurred. Please enter your location manually.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      setLocationError("An unexpected error occurred. Please enter your location manually.");
      setIsLoadingLocation(false);
    }
  };

  if (!isOpen) return null;

  // Handle manual location submission
  const handleManualLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    
    if (city && country) {
      const location = { city, country };
      localStorage.setItem('userLocation', JSON.stringify(location));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('locationUpdated'));
      
      // Close modal
      onClose();
    } else {
      setLocationError("Please enter both city and country");
    }
  };

  // Handle skip button click
  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  // Handle permission help toggle
  const togglePermissionHelp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPermissionHelp(!showPermissionHelp);
  };

  // Handle get current location button click
  const handleGetCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    getCurrentLocation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Share Your Location</h2>
          <button 
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          To provide you with the most efficient services in your area, we need your location. This helps us to reach you faster.
        </p>
        
        {locationError ? (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{locationError}</span>
            </p>
            
            {locationError.includes("Location access was denied") && (
              <div className="mt-3">
                <button 
                  onClick={togglePermissionHelp}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showPermissionHelp ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  {showPermissionHelp ? 'Hide help' : 'How to reset location permissions'}
                </button>
                
                {showPermissionHelp && (
                  <div className="mt-2 text-xs bg-white p-3 rounded border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">How to reset location permissions:</h4>
                    <ul className="space-y-2">
                      <li>
                        <span className="font-medium">Chrome:</span> Click the lock/info icon in the address bar → Site settings → Reset permissions
                      </li>
                      <li>
                        <span className="font-medium">Firefox:</span> Click the lock icon in the address bar → Clear cookies and site data
                      </li>
                      <li>
                        <span className="font-medium">Safari:</span> Safari menu → Preferences → Websites → Location → Find this website and change setting
                      </li>
                      <li>
                        <span className="font-medium">Edge:</span> Click the lock icon in the address bar → Site permissions → Reset permissions
                      </li>
                      <li>
                        <span className="font-medium">Mobile:</span> Go to your device settings → Apps → Browser → Permissions → Location
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoadingLocation ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Getting Location...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Use Current Location</span>
              </>
            )}
          </button>
        )}
        
        {locationError ? (
          <h3 className="text-base font-medium text-gray-700 mb-4">Enter your location manually:</h3>
        ) : (
          <div className="relative mb-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600 text-sm">or enter manually</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        )}
        
        <form onSubmit={handleManualLocation} className="space-y-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="city"
              name="city"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your city"
            />
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your country"
            />
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Submit
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            If you skip, you'll be asked again on your next visit.
          </p>
        </form>
      </div>
    </div>
  );
} 