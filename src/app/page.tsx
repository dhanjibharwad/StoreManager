/* eslint-disable */

import Link from "next/link";
import Image from "next/image";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-sky-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-sky-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-sky-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gray-200 rounded-full opacity-10 animate-bounce"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Company Logo and Name */}
          <div className="mb-16 animate-fade-in">
            <div className="relative mb-8">
              {/* <div className="absolute inset-0 bg-sky-400 rounded-full blur-xl opacity-20 animate-pulse"></div> */}
              <Image
                src="/images/nlg3.png"
                alt="Union Enterprise Logo"
                width={140}
                height={140}
                className="relative mx-auto drop-shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-sky-600 bg-clip-text text-transparent mb-6">
              Union Enterprise
            </h1> */}
            {/* <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-sky-600 mx-auto mb-8 rounded-full"></div> */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Your trusted partner in comprehensive business solutions. We provide innovative services 
              including complaint management, user support, and enterprise solutions to help your 
              business thrive in today's competitive market.
            </p>
            
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-sky-600 mb-2">800+</h3>
                <p className="text-gray-600 font-medium">Active Users</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-sky-600 mb-2">21+</h3>
                <p className="text-gray-600 font-medium">Registered Companies</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-sky-600 mb-2">24/7</h3>
                <p className="text-gray-600 font-medium">Support</p>
              </div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-10 mt-20">
            <Link href="/company-info" className="group transform hover:scale-105 transition-all duration-300">
              <div className="relative bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-sky-600 transition-colors duration-300">
                    Company Registration
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Register your company with us and get access to our comprehensive business solutions
                  </p>
                  <div className="mt-6 inline-flex items-center text-sky-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Get Started
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/user/home" className="group transform hover:scale-105 transition-all duration-300">
              <div className="relative bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-sky-600 transition-colors duration-300">
                    View our Portal
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access our user portal to manage your account, submit complaints, and track services
                  </p>
                  <div className="mt-6 inline-flex items-center text-sky-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Enter Portal
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Additional info section */}
          <div className="mt-20 text-center">
            <p className="text-gray-500 text-sm">
              Trusted by businesses worldwide • Available 24/7 • Secure & Reliable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
