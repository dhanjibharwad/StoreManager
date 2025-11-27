/* eslint-disable */

'use client';

import { Bell, ChevronDown, Menu, Search, AlignLeft } from 'lucide-react';
import { useContext, useEffect, useState, useRef } from 'react';
import { SidebarContext } from '@/context/SidebarContext';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BiSearchAlt2 } from 'react-icons/bi';
import { IoIosArrowDown } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';
import { RiLogoutCircleRLine } from 'react-icons/ri';

export default function Navbar() {
  const { toggle, isOpen, isMobile } = useContext(SidebarContext);
  const { user } = useAuth();
  const [userName, setUserName] = useState('Admin');
  const [userRole, setUserRole] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setUserName(user.name.split(' ')[0] || 'Admin'); // Just first name
      setUserRole(user.role || 'User');
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Function to get badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch(role.toLowerCase()) {
      case 'superadmin':
        return 'bg-amber-500';
      case 'rentaladmin':
        return 'bg-green-500';
      case 'eventadmin':
        return 'bg-purple-500';
      case 'ecomadmin':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <header className="flex justify-between items-center px-3 sm:px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 w-full">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-2 sm:gap-5">
        <button 
          id="sidebar-toggle-button"
          onClick={toggle}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md hover:bg-gray-100 transition-colors group relative flex-shrink-0"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <AlignLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
          <span className="sr-only">{isOpen ? "Collapse" : "Expand"} Sidebar</span>
        </button>
        
        
      </div>

      {/* Right: Welcome + Profile */}
      

<div className="flex items-center gap-3 sm:gap-5 ml-[-10px] ">
  {/* Bell Icon with notification indicator */}
  {/* Uncomment if needed */}
  {/* <div className="relative">
    <HiOutlineBellAlert className="text-gray-500 w-5 h-5 cursor-pointer hover:text-blue-600 transition" />
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
      2
    </span>
  </div> */}

  {/* User Info + Avatar */}
  <div
    ref={userDropdownRef}
    className="flex items-center gap-2 sm:gap-3 cursor-pointer relative"
    onClick={() => setShowUserDropdown(!showUserDropdown)}
  >
    {/* Name & Role */}
    <div className="text-right hidden sm:block leading-tight pr-1">
      <p className="text-sm font-medium text-gray-800">
        Hello, <span className="text-blue-600 font-semibold">{userName}</span>
      </p>
      <p className="text-xs flex items-center gap-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${getRoleBadgeColor(userRole)}`}></span>
        <span className="capitalize text-gray-500">{userRole}</span>
      </p>
    </div>

    {/* Avatar */}
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md text-sm">
      {userName.charAt(0)?.toUpperCase() || 'A'}
    </div>

    {/* Dropdown Icon */}
    <IoIosArrowDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />

    {/* Dropdown menu */}
    {showUserDropdown && (
      <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-md py-2 w-48 z-50 border border-gray-100">
        <Link
          href="/vendor/adminpanel/profile"
          className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
          onClick={() => setShowUserDropdown(false)}
        >
          <FaUserCircle className="w-5 h-5 text-blue-600 mr-2" /> Profile
        </Link>

        <hr className="my-1 border-gray-200" />

        <a
          href="#"
          onClick={(e) => {
            setShowUserDropdown(false);
            handleAdminLogout(e);
          }}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
        >
          <RiLogoutCircleRLine className="w-5 h-5 mr-2" /> Logout
        </a>
      </div>
    )}
  </div>

  {/* Mobile search button */}
  <button className="md:hidden ml-1 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
    <BiSearchAlt2 className="w-5 h-5 text-gray-600" />
  </button>
</div>

    </header>
  );
}
