/* eslint-disable */

'use client'

import { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Search,
  Award,
  Heart,
  PlusSquare,
  Settings,
  User,
  FileText,
  Calendar,
  File,
  Layers,
  ChevronDown,
  ChevronRight,
  LogOut,
  BarChart3,
  Building2,
  ShoppingBag,
  Trash2,
  LayoutDashboard,
} from 'lucide-react'
import Image from 'next/image';
import { SidebarContext } from '@/context/SidebarContext'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [openUserProfile, setOpenUserProfile] = useState(false)
  const [openRental, setOpenRental] = useState(false)
  const [openPages, setOpenPages] = useState(false)
  const [openExplore, setOpenExplore] = useState(false)
  const { isOpen, toggle, isMobile } = useContext(SidebarContext)

  // Debug - remove after testing
  console.log('Current pathname:', pathname)

  // Set initial open states based on current path
  useEffect(() => {
    if (pathname.includes('/profile')) {
      setOpenUserProfile(true);
    }
    if (pathname.includes('/pages')) {
      setOpenPages(true);
    }
    if (pathname.includes('/userlist') || pathname.includes('/adminslist')) {
      setOpenUserProfile(true);
    }
  }, [pathname]);

  // Close sections when sidebar is collapsed
  useEffect(() => {
    if (!isOpen) {
      setOpenUserProfile(false);
      setOpenPages(false);
    }
  }, [isOpen]);

  // Function to close sidebar on mobile after navigation
  const closeSidebarOnMobile = () => {
    if (isMobile && isOpen) {
      toggle();
    }
  };
  
  // Function to handle admin logout without affecting user account
  const handleAdminLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Get the admin auth token from localStorage
      const token = localStorage.getItem('adminAuthToken');
      
      if (token) {
        // Call the admin logout API to remove the session from database
        await fetch(`/api/admin/login?token=${token}`, {
          method: 'DELETE',
        });
        
        // Remove admin token from localStorage
        localStorage.removeItem('adminAuthToken');
        
        // Clear admin session cookie
        document.cookie = 'adminAuthToken=; path=/; max-age=0; SameSite=Lax';
      }
      
      // Redirect to admin login page
      router.push('/vendor/login');
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  return (
    <aside className={`bg-gradient-to-r from-gray-900 to-gray-800 text-white h-full flex flex-col transition-all duration-300 z-40 overflow-x-hidden shadow-lg ${
      !isOpen ? 'w-[70px]' : isMobile ? 'w-[250px] max-w-[85vw]' : 'w-64'
    }`}>
      {/* Header with logo */}
      <div className="flex items-center justify-center px-4 py-5 border-b border-gray-700/50">
        <Link href="/vendor/adminpanel" className="flex items-center" onClick={closeSidebarOnMobile}>
          {!isOpen ? (
            <div className="w-10 h-10 rounded-md flex items-center justify-center">
              <Image
                src="/images/nlg3.png"
                alt="Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
          ) : (
            <Image
              src="/images/nlg3.png"
              alt="Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          )}
        </Link>
      </div>

      

      {/* Navigation */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${!isOpen ? 'px-1 scrollbar-hide' : 'px-3 custom-scrollbar'}`}>
        <nav className="space-y-1.5">
          <SidebarItem 
            icon={BarChart3} 
            label="Dashboard" 
            path="/vendor/adminpanel" 
            isActive={pathname === '/vendor/adminpanel'}
            collapsed={!isOpen}
            closeSidebar={closeSidebarOnMobile}
          />

{isOpen && (
            <CollapsibleSection
              label="Manage Panels"
              icon={User}
              isOpen={openUserProfile}
              onToggle={() => setOpenUserProfile(!openUserProfile)}
              isActive={pathname.startsWith('/vendor/adminpanel/userlist') || pathname.startsWith('/vendor/adminpanel/adminslist')}
              items={[
                { 
                  label: 'User List', 
                  path: `/vendor/adminpanel/userlist`, 
                  isActive: pathname.startsWith('/vendor/adminpanel/userlist')
                },
                { 
                  label: 'Technician List', 
                  path: `/vendor/adminpanel/technicianlist`, 
                  isActive: pathname.startsWith('/vendor/adminpanel/technicianlist')
                },
                { 
                  label: 'Admin List', 
                  path: `/vendor/adminpanel/adminslist`, 
                  isActive: pathname.startsWith('/vendor/adminpanel/adminslist')
                },
                { 
                  label: 'User Management', 
                  path: `/vendor/adminpanel/users`, 
                  isActive: pathname.startsWith('/vendor/adminpanel/users')
                },
              ]}
              closeSidebar={closeSidebarOnMobile}
            />
          )}

          {!isOpen && (
            <SidebarItem 
              icon={User} 
              label="Users" 
              path="/vendor/adminpanel/userlist" 
              isActive={pathname.startsWith('/vendor/adminpanel/userlist') || pathname.startsWith('/vendor/adminpanel/adminslist')}
              collapsed={!isOpen}
              closeSidebar={closeSidebarOnMobile}
            />
          )}
          
          
          <SidebarItem 
            icon={Home} 
            label="Complaints List" 
            path="/vendor/adminpanel/complaints/" 
            isActive={pathname.startsWith('/vendor/adminpanel/complaints/')}
            collapsed={!isOpen}
            closeSidebar={closeSidebarOnMobile}
          />

          <SidebarItem 
            icon={Award} 
            label="Brand Slider" 
            path="/vendor/adminpanel/brandslider" 
            isActive={pathname.startsWith('/vendor/adminpanel/brandslider')}
            collapsed={!isOpen}
            closeSidebar={closeSidebarOnMobile}
          /> 

        </nav>
      </div>

      {/* Logout button at the bottom */}
      <div className={`mt-auto border-t border-gray-700/50 ${!isOpen ? 'px-1 py-4' : 'px-3 py-4'}`}>
        <a
          href="#"
          onClick={handleAdminLogout}
          className={`flex items-center ${!isOpen ? 'justify-center' : 'px-3'} py-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors group relative`}
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="ml-3 text-sm">Logout</span>}
          
          {/* Tooltip for collapsed mode */}
          {!isOpen && (
            <div className="absolute left-full ml-2 rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap z-50">
              Logout Admin
            </div>
          )}
        </a>
      </div>
    </aside>
  )
}

function SidebarItem({ 
  icon: Icon, 
  label, 
  path, 
  isActive,
  collapsed,
  closeSidebar
}: { 
  icon: any; 
  label: string; 
  path: string;
  isActive: boolean;
  collapsed: boolean;
  closeSidebar: () => void;
}) {
  return (
    <Link
      href={path}
      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-2.5 rounded-md transition-all duration-200 group relative ${
        isActive 
          ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md' 
          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
      }`}
      onClick={closeSidebar}
    >
      <div className="flex items-center">
        <Icon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} ${isActive ? 'text-white' : ''}`} />
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
      </div>
      {!collapsed && isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
      )}
      
      {/* Tooltip for collapsed mode */}
      {collapsed && (
        <div className="absolute left-full ml-2 rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  )
}

function CollapsibleSection({
  label,
  icon: Icon,
  isOpen,
  onToggle,
  isActive,
  items,
  closeSidebar
}: {
  label: string
  icon: any
  isOpen: boolean
  onToggle: () => void
  isActive: boolean
  items: { label: string; path: string; isActive: boolean }[]
  closeSidebar: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-2 py-2.5 rounded-md transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`}
      >
        <span className="flex items-center">
          <Icon className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">{label}</span>
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-1 ml-3 pl-3 border-l border-gray-700/50 space-y-1">
          {items.map(({ label, path, isActive }) => (
            <Link
              key={path}
              href={path}
              className={`flex items-center justify-between px-2 py-2 rounded-md text-sm transition-all duration-200 ${
                isActive 
                  ? 'text-white bg-gray-700/50 shadow-sm' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
              onClick={closeSidebar}
            >
              <span className="font-medium truncate">{label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
