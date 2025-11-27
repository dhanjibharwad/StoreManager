'use client'

import React from 'react';
import { useLocation } from '@/lib/locationContext';

interface LocationButtonProps {
  variant?: 'navbar' | 'hero' | 'mobile';
  className?: string;
}

export default function LocationButton({ variant = 'navbar', className = '' }: LocationButtonProps) {
  const { userLocation, promptForLocation } = useLocation();

  // Handle location button click
  const handleLocationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    promptForLocation();
  };

  return (
    <>
      {variant === 'navbar' && (
        <div className={`hidden sm:flex items-center ${className}`}>
          {userLocation && userLocation.city !== "Unknown" ? (
            <div className="flex items-center text-white">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">
                {userLocation.city}, {userLocation.country}
              </span>
              <button 
                onClick={handleLocationClick}
                className="ml-1 text-white/70 hover:text-white"
                title="Change location"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLocationClick}
              className="text-white flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Set Location</span>
            </button>
          )}
        </div>
      )}

      {variant === 'hero' && (
        <div className={`absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 ${className}`}>
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {userLocation && userLocation.city !== "Unknown" ? (
            <span className="text-sm font-medium text-gray-800">
              {userLocation.city}, {userLocation.country}
            </span>
          ) : (
            <button 
              onClick={handleLocationClick}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Set Location
            </button>
          )}
        </div>
      )}

      {variant === 'mobile' && (
        <div className={`flex items-center ${className}`}>
          <button 
            onClick={handleLocationClick}
            className="flex items-center gap-2 text-gray-700"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {userLocation && userLocation.city !== "Unknown" ? (
              <span className="text-sm font-medium">
                {userLocation.city}, {userLocation.country}
              </span>
            ) : (
              <span className="text-sm font-medium">Set Location</span>
            )}
          </button>
        </div>
      )}
    </>
  );
} 