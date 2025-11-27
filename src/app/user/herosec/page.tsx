/* eslint-disable */

"use client";

import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

const HeroPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Floating animation keyframes
  const floatingAnimation = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-10px) rotate(1deg); }
      50% { transform: translateY(-5px) rotate(0deg); }
      75% { transform: translateY(-8px) rotate(-1deg); }?
    }
    
    @keyframes slowFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
  `;

  return (
    <>
      <style>{floatingAnimation}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating clouds */}
          <div className="absolute top-20 left-10 w-32 h-20 bg-gray-200 rounded-full opacity-60" style={{ animation: 'slowFloat 6s ease-in-out infinite' }}></div>
          <div className="absolute top-32 right-20 w-24 h-16 bg-gray-300 rounded-full opacity-40" style={{ animation: 'slowFloat 8s ease-in-out infinite 2s' }}></div>
          <div className="absolute bottom-40 left-20 w-28 h-18 bg-gray-200 rounded-full opacity-50" style={{ animation: 'slowFloat 7s ease-in-out infinite 1s' }}></div>
          <div className="absolute bottom-60 right-10 w-20 h-12 bg-gray-300 rounded-full opacity-30" style={{ animation: 'slowFloat 5s ease-in-out infinite 3s' }}></div>
          
          {/* Additional floating elements */}
          <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-gray-400 rounded-full opacity-20" style={{ animation: 'bounce 4s ease-in-out infinite' }}></div>
          <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-gray-500 rounded-full opacity-25" style={{ animation: 'bounce 3s ease-in-out infinite 1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-gray-300 rounded-full opacity-15" style={{ animation: 'bounce 5s ease-in-out infinite 2s' }}></div>
        </div>

        <div className="container mx-auto px-6 py-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
              Your Problems, Our Priority
            </h1>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-8">
              Fast, reliable, and professional support for every business need.
            </h2>
          </div>

          {/* Devices Showcase */}
          <div className="relative flex justify-center items-center">
            {/* Desktop */}
            <div className="relative z-30">
              <div className="relative">
                {/* Monitor Stand */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  {/* Single Base Stand */}
                  <div className="w-20 h-3 bg-gray-500 rounded-full shadow-lg"></div>
                </div>
                
                {/* Monitor */}
                <div 
                  className="w-96 h-72 bg-gray-800 rounded-lg p-4 shadow-2xl transition-transform hover:scale-105"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
                    {/* Video Container */}
                    <div className="absolute inset-0 bg-black">
                      <video 
                        ref={(video) => {
                          if (video) {
                            if (isPlaying && !isHovered) {
                              video.play();
                            } else {
                              video.pause();
                            }
                            video.muted = isMuted;
                          }
                        }}
                        className="w-full h-full object-cover rounded-md"
                        src="/images/vik1.mp4"
                        controls={false}
                        muted={isMuted}
                        autoPlay={false}
                        loop
                        playsInline
                      />

                    </div>
                    
                    {/* Website Header Mockup */}
                    <div className="absolute top-0 left-0 right-0 h-5 bg-white border-b border-gray-200 flex items-center px-4">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop */}
            <div className="absolute left-12 top-8 z-20" style={{ animation: 'float 8s ease-in-out infinite 1s' }}>
              <div className="w-64 h-44 bg-gray-700 rounded-t-lg p-2 shadow-xl transform -rotate-12">
                <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
                  {/* Image Container */}
                  <div className="absolute inset-0">
                    <img 
                      src="/images/ig1.png"
                      alt="Laptop Website Demo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-4 bg-white border-b border-gray-200 flex items-center px-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-b-lg"></div>
              </div>
            </div>

            {/* Tablet */}
            <div className="absolute right-16 top-4 z-20" style={{ animation: 'float 7s ease-in-out infinite 2s' }}>
              <div className="w-44 h-60 bg-gray-800 rounded-lg p-2 shadow-xl transform rotate-12">
                <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
                  {/* Image Container */}
                  <div className="absolute inset-0">
                    <img 
                      src="/images/tb1.png"
                      alt="Tablet Website Demo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="absolute right-4 bottom-8 z-10" style={{ animation: 'float 5s ease-in-out infinite 3s' }}>
              <div className="w-20 h-36 bg-gray-900 rounded-xl p-1 shadow-xl">
                <div className="w-full h-full bg-white rounded-lg overflow-hidden relative">
                  {/* Image Container */}
                  <div className="absolute inset-0">
                    <img 
                      src="/images/take1.jpg"
                      alt="Mobile Website Demo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Union Enterprise delivers innovative digital solutions designed to simplify complex technical problems.
        With expert support and seamless service, we keep your business running without interruptions.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold cursor-pointer">
                Get Started Today
              </button>
              <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold cursor-pointer">
                Send Your Query
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroPage;
          