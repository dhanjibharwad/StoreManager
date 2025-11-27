/* eslint-disable */

'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function CareerPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-1 left-2 md:left-6 md:left-6 z-50 transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="w-[200px] h-[250px] overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-0 right-2 text-red-500 hover:text-red-600 z-10 p-1 rounded-full bg-white backdrop-blur-md shadow-md transition-colors duration-200 hover:bg-white/90 cursor-pointer"
        >
          <FaTimes size={12} />
        </button>

        {/* Character Image */}
        {/* <div className="relative h-[120px] overflow-hidden">
          <Image
            src="/images/in1.png"
            alt="Join our team"
            fill
            className="object-cover"
          />
        </div> */}

        {/* Content */}
        <div className="p-2 border border-gray-100 bg-white/90 backdrop-blur-md rounded-b-2xl  h-[120px]  flex flex-col justify-between ">
          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">
            We are happy to Serve You!
          </h3>
          
          <button 
            onClick={() => {
              // Find the navbar's CategoryDrawer button and click it
              const postAdButton = document.querySelector('[data-category-drawer-trigger]');
              handleClose();
              if (postAdButton) {
                (postAdButton as HTMLButtonElement).click();
              }
            }}
            className="w-full bg-gray-500 hover:bg-gray-900 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mb-1 text-sm cursor-pointer"
          >
            Contact Now
            <FaArrowRight size={10} />
          </button>

          <p className="text-orange-500 text-xs font-medium flex items-center gap-1">
            <span>⚡</span>
            Join our community today!
          </p>
        </div>
      </div>
    </div>
  );
}