'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import LocationModal from '@/components/ui/LocationModal';

type UserLocationType = {
  city: string;
  country: string;
} | null;

interface LocationContextType {
  userLocation: UserLocationType;
  showLocationModal: boolean;
  setShowLocationModal: React.Dispatch<React.SetStateAction<boolean>>;
  promptForLocation: () => void;
  setLocation: (location: UserLocationType) => void;
  skipLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocationType>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Load user location from localStorage
  useEffect(() => {
    const loadLocation = () => {
      try {
        const storedLocation = localStorage.getItem('userLocation');
        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);
          
          // If location was skipped (city is Unknown), show the modal again
          if (parsedLocation.city === "Unknown" || parsedLocation.country === "Unknown") {
            setShowLocationModal(true);
          } else {
            setUserLocation(parsedLocation);
          }
        } else {
          // Show location modal if location is not stored
          setShowLocationModal(true);
        }
      } catch (error) {
        console.error("Error parsing location data:", error);
        setShowLocationModal(true);
      }
    };

    // Load location on initial render
    if (typeof window !== 'undefined') {
      loadLocation();
    }

    // Listen for storage changes (when location is updated from another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userLocation') {
        loadLocation();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);

      // Custom event for same-tab updates
      const handleCustomStorageChange = () => loadLocation();
      window.addEventListener('locationUpdated', handleCustomStorageChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('locationUpdated', handleCustomStorageChange);
      };
    }
  }, []);

  // Function to prompt user for location
  const promptForLocation = () => {
    if (typeof window !== 'undefined') {
      // Remove any stored location
      localStorage.removeItem('userLocation');
      
      // Update local state
      setShowLocationModal(true);
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new Event('locationUpdated'));
    }
  };

  const setLocation = (location: UserLocationType) => {
    if (location && typeof window !== 'undefined') {
      localStorage.setItem('userLocation', JSON.stringify(location));
      setUserLocation(location);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('locationUpdated'));
    }
  };

  const skipLocation = () => {
    // Just close the modal without storing anything in localStorage
    setShowLocationModal(false);
    
    // Store temporary location for this session only
    setUserLocation({ city: "Unknown", country: "Unknown" });
    
    if (typeof window !== 'undefined') {
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('locationUpdated'));
    }
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        showLocationModal,
        setShowLocationModal,
        promptForLocation,
        setLocation,
        skipLocation
      }}
    >
      {children}
      {showLocationModal && (
        <LocationModal 
          isOpen={showLocationModal} 
          onClose={() => setShowLocationModal(false)} 
        />
      )}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
} 