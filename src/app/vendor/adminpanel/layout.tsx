/* eslint-disable */

'use client';
import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '@/app/vendor/adminpanel/sidebar';
import Navbar from '@/app/vendor/adminpanel/navbar';
import { SidebarProvider, SidebarContext } from '@/context/SidebarContext';
import { useAuth, AuthProvider } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import Loader from './components/Loader';

function LayoutWithToggle({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useContext(SidebarContext);
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [checkingAdminAccess, setCheckingAdminAccess] = useState(true);
  
  // Check if user has admin privileges
  const isAdmin = user?.role && ['superadmin', 'rentaladmin'].includes(user.role);
  
  useEffect(() => {
    // Check for admin token
    const checkAdminAuth = async () => {
      try {
        const adminToken = localStorage.getItem('adminAuthToken');
        
        if (!adminToken) {
          setHasAdminAccess(false);
          setCheckingAdminAccess(false);
          return;
        }
        
        // Verify the admin token is valid by making an API call
        const response = await fetch('/api/admin/check-credentials', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        if (response.ok) {
          setHasAdminAccess(true);
        } else {
          setHasAdminAccess(false);
          // Clear invalid admin token
          localStorage.removeItem('adminAuthToken');
          document.cookie = 'adminAuthToken=; path=/; max-age=0; SameSite=Lax';
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAdminAccess(false);
      } finally {
        setCheckingAdminAccess(false);
      }
    };
    
    checkAdminAuth();
  }, []);
  
  useEffect(() => {
    // If admin access check is complete and user doesn't have admin access
    if (!checkingAdminAccess && !hasAdminAccess) {
      // Redirect to admin login page
      router.push('/vendor/login');
    }
  }, [hasAdminAccess, checkingAdminAccess, router]);

  // Show loading while checking authentication or admin access
  if (loading || checkingAdminAccess) {
    return <Loader fullScreen text="Loading admin panel..." />;
  }

  // If not authorized, don't render children
  if (!hasAdminAccess) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - hidden on mobile by default, shown when isOpen is true */}
      <div className={`h-full shrink-0 fixed md:relative z-30 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'md:translate-x-0 -translate-x-full'
      }`}>
        <Sidebar />
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden" 
          onClick={() => {
            // Close sidebar when clicking overlay (this requires updating SidebarContext)
            const sidebarContext = document.getElementById('sidebar-toggle-button');
            if (sidebarContext) {
              (sidebarContext as HTMLButtonElement).click();
            }
          }}
        />
      )}
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 w-full transition-all duration-300`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <LayoutWithToggle>{children}</LayoutWithToggle>
      </SidebarProvider>
    </AuthProvider>
  );
}
