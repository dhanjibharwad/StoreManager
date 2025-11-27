'use client';

import React from 'react';
import UserNavbar from './components/Navbar';
import UserFooter from './components/Footer';
import CareerPopup from './components/CareerPopup';
// import { LocationProvider } from '@/lib/locationContext';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // {/* <LocationProvider> */}
    <div className="flex flex-col min-h-screen">
      <UserNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <UserFooter />
      <CareerPopup />
    </div>
    // {/* </LocationProvider> */}
  );
} 