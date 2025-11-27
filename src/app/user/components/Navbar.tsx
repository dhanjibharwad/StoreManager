/* eslint-disable */

'use client'
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoMdClose } from 'react-icons/io';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/lib/authContext';
import LocationButton from '@/components/ui/LocationButton';

type DropdownRefs = {
  services: React.RefObject<HTMLDivElement | null>;
  support: React.RefObject<HTMLDivElement | null>;
  help: React.RefObject<HTMLDivElement | null>;
};

export default function UserNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Create refs for each dropdown menu container
  const dropdownRefs: DropdownRefs = {
    services: useRef<HTMLDivElement | null>(null),
    support: useRef<HTMLDivElement | null>(null),
    help: useRef<HTMLDivElement | null>(null),
  };

  // Create refs for dropdown content
  const dropdownContentRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close any open mobile dropdowns when closing the menu
    if (isMenuOpen) setActiveMobileDropdown(null);
  };

  const handleMouseEnter = (menu: string) => {
    setActiveDropdown(menu);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle main dropdown menus
      if (activeDropdown) {
        const currentDropdownRef = dropdownRefs[activeDropdown as keyof typeof dropdownRefs]?.current;
        const dropdownContent = dropdownContentRef.current;

        if (
          currentDropdownRef &&
          !currentDropdownRef.contains(event.target as Node) &&
          dropdownContent &&
          !dropdownContent.contains(event.target as Node)
        ) {
          setActiveDropdown(null);
        }
      }

      // Handle user menu dropdown
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown, isUserMenuOpen]);

  return (
    <>
      <header className="header sticky top-0 left-0 w-full z-50 bg-white shadow">
        {/* Top navbar with logo, location, login */}
        <div className="bg-[#4A70A9] py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/user/home" className="flex-shrink-0">
                  <div className="relative flex items-center h-12 sm:h-14">
                    <span className="text-3xl sm:text-4xl font-semibold tracking-wide drop-shadow-md font-serif text-white">
                      Store Manager
                    </span>
                  </div>
                </Link>

              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Desktop view - show user menu and login */}
                <div className="hidden sm:flex items-center space-x-4">
                  {isAuthenticated && user ? (
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={toggleUserMenu}
                        className="flex items-center text-white hover:text-gray-200 cursor-pointer"
                      >
                        {user.company_name && (
                          <span className="text-xs sm:text-sm mr-2 px-2 py-1 bg-blue-600 rounded-md font-medium">
                            {user.company_name}
                          </span>
                        )}
                        <span className="text-sm sm:text-base mr-2">{user.name}</span>
                        <FaUserCircle className="h-6 w-6" />
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200">
                          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-600 flex items-center justify-center text-white shadow-sm">
                                <FaUserCircle className="h-6 w-6" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.phone || user.email}
                                </p>
                                {user.company_name && (
                                  <p className="text-xs text-blue-600 truncate font-medium">
                                    {user.company_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="py-1">
                            <Link href="/user/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Your Profile
                            </Link>
                            {user.role !== 'technician' && (
                              <Link href="/user/complaint" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Post Query
                              </Link>
                            )}
                            {user.role !== 'technician' && (
                              <Link href="/user/query-status" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Query Status
                                <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Track</span>
                              </Link>
                            )}
                            {user.role && ['technician'].includes(user.role) && (
                              <Link href="/technician/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Technician Dashboard
                              </Link>
                            )}
                            {user.role && ['superadmin'].includes(user.role) && (
                              <Link href="/vendor/setup-credentials" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Admin Panel
                              </Link>
                            )}
                          </div>
                          <div className="border-t border-gray-100 mt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-white flex items-center">
                      <Link href="/user/auth/login">
                        <span className="text-bold sm:text-base hover:underline">Login</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile view - show user icon or login */}
                <div className="sm:hidden">
                  {isAuthenticated && user ? (
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center text-white hover:text-gray-200 cursor-pointer"
                    >
                      <FaUserCircle className="h-6 w-6" />
                    </button>
                  ) : (
                    <Link href="/user/auth/login">
                      <span className="text-sm hover:underline text-black">Login</span>
                    </Link>
                  )}
                </div>

                {!isAuthenticated ? (
                  <Link
                    href="/user/auth/register"
                    className="bg-white text-gray-800 px-2 py-1 sm:px-4 sm:py-1 rounded-md font-medium flex items-center text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Register Here</span>
                    <span className="ml-1 text-xs bg-gray-800 text-white px-1 rounded">Start</span>
                  </Link>
                ) : user?.role === 'technician' ? (
                  <Link
                    href="/technician/dashboard"
                    className="bg-white text-gray-800 px-2 py-1 sm:px-4 sm:py-1 rounded-md font-medium flex items-center text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Technical Dashboard</span>
                    <span className="ml-1 text-xs bg-gray-800 text-white px-1 rounded">Tech</span>
                  </Link>
                ) : (
                  <Link
                    href="/user/complaint"
                    className="bg-white text-gray-800 px-2 py-1 sm:px-4 sm:py-1 rounded-md font-medium flex items-center text-xs sm:text-sm cursor-pointer"
                  >
                    <span>Post Your Query</span>
                    <span className="ml-1 text-xs bg-gray-800 text-white px-1 rounded">Help</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main navigation menu */}
        <nav className="bg-white py-1 sm:py-0 shadow-sm transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Main desktop menu */}
              <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
                <div className="relative group" ref={dropdownRefs.services}>
                  <button
                    className="text-gray-600 hover:text-gray-900 font-medium flex items-center transition duration-200 ease-in-out"
                    onMouseEnter={() => handleMouseEnter('services')}
                  >
                    Our Services
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="relative group" ref={dropdownRefs.support}>
                  <button
                    className="text-gray-800 hover:text-gray-900 font-medium flex items-center transition duration-200 ease-in-out"
                    onMouseEnter={() => handleMouseEnter('support')}
                  >
                    Support
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="relative group" ref={dropdownRefs.help}>
                  <button
                    className="text-gray-800 hover:text-gray-900 font-medium flex items-center transition duration-200 ease-in-out"
                    onMouseEnter={() => handleMouseEnter('help')}
                  >
                    Help
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <Link
                  href="/company-info/"
                  className="bg-white text-gray-900 hover:text-[#4A70A9] px-4 py-2 rounded-md font-medium flex items-center transition-all duration-300 ease-in-out hover:shadow-lg"
                >
                  {/* <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg> */}
                  Company Registration
                </Link>

                {/* Add Employee button - Only for admin users */}
                {isAuthenticated && user && user.role === 'admin' && (
                  <Link
                    href="/admin/users/register"
                    className="bg-gradient-to-r from-sky-400 to-sky-500 text-white hover:from-sky-500 hover:to-sky-600 px-4 py-2 rounded-md font-medium flex items-center transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Employee
                  </Link>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex w-full justify-between items-center">
                <span className="text-gray-800 font-medium">Menu</span>
                <button
                  onClick={toggleMenu}
                  className="text-gray-700 hover:text-black focus:outline-none transition duration-300"
                  aria-label="Toggle menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Mega menu dropdown - Desktop */}
        {activeDropdown && (
          <div
            className="hidden md:block absolute z-50 w-full bg-white shadow-lg border-t border-gray-200"
            ref={dropdownContentRef}
            onMouseEnter={() => setActiveDropdown(activeDropdown)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {activeDropdown === 'services' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-4">Our Services</h3>
                    <ul className="space-y-2">
                      <li><Link href="/user/myservicediv" className="text-gray-600 hover:text-black">Service Overview</Link></li>
                      <li><Link href="/user/newsec" className="text-gray-600 hover:text-black">Workflow</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-4">Information</h3>
                    <ul className="space-y-2">
                      <li><Link href="/user/FAQ" className="text-gray-600 hover:text-black">FAQ</Link></li>
                      <li><Link href="/user/how-it-works" className="text-gray-600 hover:text-black">How It Works</Link></li>
                    </ul>
                  </div>
                </div>
              )}

              {activeDropdown === 'support' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-4">Support</h3>
                    <ul className="space-y-2">
                      <li><Link href="/user/contact" className="text-gray-600 hover:text-black">Contact Us</Link></li>
                      {/* <li><Link href="/user/complaint" className="text-gray-600 hover:text-black">Submit Complaint</Link></li> */}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-4">Information</h3>
                    <ul className="space-y-2">
                      <li><Link href="/user/FAQ" className="text-gray-600 hover:text-black">FAQ</Link></li>
                      <li><Link href="/user/how-it-works" className="text-gray-600 hover:text-black">How It Works</Link></li>
                    </ul>
                  </div>
                </div>
              )}

              {activeDropdown === 'help' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-4">Support</h3>
                    <ul className="space-y-2">
                      <li><Link href="/user/contact" className="text-gray-600 hover:text-black">Contact Us</Link></li>
                      {/* <li><Link href="/user/auth/register" className="text-gray-600 hover:text-black">Submit Complaint</Link></li> */}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-4">Legal</h3>
                    <ul className="space-y-2">
                      <li><Link href="/user/terms" className="text-gray-600 hover:text-black">Terms & Conditions</Link></li>
                      <li><Link href="/user/privacy" className="text-gray-600 hover:text-black">Privacy Policy</Link></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={toggleMenu}>
            <div
              className="fixed inset-y-0 right-0 max-w-[85%] w-full bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700"
                  onClick={toggleMenu}
                >
                  <IoMdClose className="h-6 w-6" />
                </button>
              </div>

              <LocationButton variant="mobile" className='px-2 pt-2 pb-4' />

              <nav className="px-2 pt-2 pb-4">
                <div className="space-y-1 py-3">
                  <div className="border-b border-gray-100 pb-2">
                    <button
                      onClick={() => setActiveMobileDropdown(activeMobileDropdown === 'services' ? null : 'services')}
                      className="flex items-center justify-between w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md"
                    >
                      <span>Our Services</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform duration-200 ${activeMobileDropdown === 'services' ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {activeMobileDropdown === 'services' && (
                      <div className="mt-2 pl-4 pr-2 space-y-1 bg-gray-50 rounded-md py-2">
                        <Link href="/user/myservicediv" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          Service Overview
                        </Link>
                        <Link href="/user/newsec" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          Workflow
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="border-b border-gray-100 pb-2">
                    <button
                      onClick={() => setActiveMobileDropdown(activeMobileDropdown === 'support' ? null : 'support')}
                      className="flex items-center justify-between w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md"
                    >
                      <span>Support</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform duration-200 ${activeMobileDropdown === 'support' ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {activeMobileDropdown === 'support' && (
                      <div className="mt-2 pl-4 pr-2 space-y-1 bg-gray-50 rounded-md py-2">
                        <Link href="/user/contact" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          Contact Us
                        </Link>
                        {/* <Link href="/user/complaint" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          Submit Complaint
                        </Link> */}
                      </div>
                    )}
                  </div>

                  <div className="border-b border-gray-100 pb-2">
                    <button
                      onClick={() => setActiveMobileDropdown(activeMobileDropdown === 'help' ? null : 'help')}
                      className="flex items-center justify-between w-full px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md"
                    >
                      <span>Help</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transition-transform duration-200 ${activeMobileDropdown === 'help' ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {activeMobileDropdown === 'help' && (
                      <div className="mt-2 pl-4 pr-2 space-y-1 bg-gray-50 rounded-md py-2">
                        <Link href="/user/contact" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          Contact Us
                        </Link>
                        <Link href="/user/FAQ" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          FAQ
                        </Link>
                        <Link href="/user/terms" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          Terms & Conditions
                        </Link>
                        <Link href="/user/privacy" onClick={toggleMenu} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-red-600">
                          Privacy Policy
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-2 space-y-3">
                    <Link
                      href="/company-info/"
                      onClick={toggleMenu}
                      className="bg-gradient-to-r from-gray-100 to-white text-gray-800 hover:from-gray-200 hover:to-gray-100 px-4 py-3 rounded-md font-medium flex items-center transition-all duration-300 ease-in-out shadow-md hover:shadow-lg border border-gray-300 hover:border-gray-400 w-full justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Company Registration
                    </Link>

                    {/* Add Employee button - Only for admin users */}
                    {isAuthenticated && user && user.role === 'admin' && (
                      <Link
                        href="/admin/users/register"
                        onClick={toggleMenu}
                        className="bg-gradient-to-r from-sky-400 to-sky-500 text-white hover:from-sky-500 hover:to-sky-600 px-4 py-3 rounded-md font-medium flex items-center transition-all duration-300 ease-in-out shadow-md hover:shadow-lg w-full justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Employee
                      </Link>
                    )}
                  </div>
                </div>

                {/* Mobile user section at the bottom */}
                <div className="px-4 py-6">
                  <div className="flex flex-col space-y-3">
                    {isAuthenticated && user ? (
                      <>
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-600 flex items-center justify-center text-white shadow-md">
                              <FaUserCircle className="h-8 w-8" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.phone || user.email}</p>
                              {user.company_name && (
                                <p className="text-xs text-blue-600 font-medium">{user.company_name}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <Link href="/user/profile" onClick={toggleMenu} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Your Profile
                            </Link>

                            {user.role !== 'technician' && (
                              <Link href="/user/complaint" onClick={toggleMenu} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Post Query
                              </Link>
                            )}

                            {user.role !== 'technician' && (
                              <Link href="/user/query-status" onClick={toggleMenu} className="flex items-center px-3 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border-l-4 border-blue-500">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Query Status
                                <span className="ml-auto text-xs bg-blue-600 text-white px-1 py-0.5 rounded">Track</span>
                              </Link>
                            )}

                            {user.role && ['technician'].includes(user.role) && (
                              <Link href="/technician/dashboard" onClick={toggleMenu} className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Technician Dashboard
                              </Link>
                            )}
                            {user.role && ['superadmin'].includes(user.role) && (
                              <Link href="/vendor/setup-credentials" onClick={toggleMenu} className="flex items-center px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Admin Panel
                              </Link>
                            )}

                            <button
                              onClick={() => {
                                handleLogout();
                                toggleMenu();
                              }}
                              className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-2"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link href="/user/auth/login" onClick={toggleMenu} className="bg-red-600 text-white text-center py-3 rounded-md font-medium text-l shadow-sm hover:bg-gray-700 transition-colors">Login / Register</Link>
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
} 