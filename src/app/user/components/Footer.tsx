// /* eslint-disable */
// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { FaFacebook, FaTwitter, FaInstagram, FaGithub, FaArrowUp } from 'react-icons/fa';
// import Image from 'next/image';

// export default function UserFooter() {
//   const [showBackToTop, setShowBackToTop] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setShowBackToTop(window.scrollY > 300);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth'
//     });
//   };

//   return (
//     <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-400 relative overflow-hidden">
//       {/* Decorative elements */}
//       <div className="absolute inset-0 opacity-10">
//         <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative max-w-7xl mx-auto px-6 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
//           {/* Column 1 - Logo & Description */}
//           <div className="md:col-span-1">
//             <div className="mb-6 transform hover:scale-105 transition-transform duration-300 inline-block">
//               <Image
//                 src="/images/nlg3.png"
//                 alt="Logo"
//                 width={70}
//                 height={70}
//                 className="object-contain drop-shadow-2xl"
//                 priority
//               />
//             </div>
//             <p className="mb-6 text-gray-300 leading-relaxed">
//               Transform your business with our modern solutions.
//             </p>
//             <div className="flex space-x-4">
//               <a href="#" className="group">
//                 <div className="bg-gray-800 hover:bg-sky-500 p-3 rounded-lg transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-500/50">
//                   <FaFacebook size={18} className="text-gray-400 group-hover:text-white transition-colors" />
//                 </div>
//               </a>
//               <a href="#" className="group">
//                 <div className="bg-gray-800 hover:bg-sky-400 p-3 rounded-lg transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-sky-400/50">
//                   <FaTwitter size={18} className="text-gray-400 group-hover:text-white transition-colors" />
//                 </div>
//               </a>
//               <a href="#" className="group">
//                 <div className="bg-gray-800 hover:bg-pink-500 p-3 rounded-lg transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pink-500/50">
//                   <FaInstagram size={18} className="text-gray-400 group-hover:text-white transition-colors" />
//                 </div>
//               </a>
//               <a href="#" className="group">
//                 <div className="bg-gray-800 hover:bg-purple-500 p-3 rounded-lg transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/50">
//                   <FaGithub size={18} className="text-gray-400 group-hover:text-white transition-colors" />
//                 </div>
//               </a>
//             </div>
//           </div>

//           {/* Column 2 - Product */}
//           <div>
//             <h4 className="text-white font-bold mb-6 text-lg relative inline-block">
//               Product
//               <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-sky-500 to-transparent"></span>
//             </h4>
//             <ul className="space-y-3">
//               <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Home</Link></li>
//               <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Roadmap</Link></li>
//               <li><Link href="/user/pricing/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Pricing</Link></li>
//               <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Documentation</Link></li>
//               <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Features</Link></li>
//             </ul>
//           </div>

//           {/* Column 3 - Company */}
//           <div>
//             <h4 className="text-white font-bold mb-6 text-lg relative inline-block">
//               Company
//               <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-sky-500 to-transparent"></span>
//             </h4>
//             <ul className="space-y-3">
//               <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Blog</Link></li>
//               <li><Link href="/user/contact/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Contact Us</Link></li>
//               <li><Link href="/user/how-it-works/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">About</Link></li>
//               <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Careers</Link></li>
//               <li><Link href="/user/FAQ" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">FAQs</Link></li>
//             </ul>
//           </div>

//           {/* Column 4 - Legal */}
//           <div>
//             <h4 className="text-white font-bold mb-6 text-lg relative inline-block">
//               Legal
//               <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-sky-500 to-transparent"></span>
//             </h4>
//             <ul className="space-y-3">
//               <li><Link href="/user/privacy/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Privacy Policy</Link></li>
//               <li><Link href="/user/terms/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Terms & Conditions</Link></li>
//               <li><Link href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Cookie Policy</Link></li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div className="border-t border-gray-800/50 backdrop-blur-sm relative">
//         <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center">
//           <p className="text-gray-500 text-sm mb-4 md:mb-0">
//             © 2025 STORE. All rights reserved.
//           </p>
//           <div className="flex items-center space-x-6">
//             <span className="text-gray-500 text-sm">
//               Distributed by <span className="text-sky-500 font-semibold">STORE</span>
//             </span>

//             {showBackToTop && (
//               <button
//                 onClick={scrollToTop}
//                 className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-sky-500/50"
//                 aria-label="Back to top"
//               >
//                 <FaArrowUp size={14} />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }



// src/components/Footer.tsx

import React from 'react';
import { Phone, MessageCircle, Mail } from "lucide-react";

const linkClasses = 'text-black hover:text-amber-800 transition-colors duration-200';
const titleClasses = 'text-base font-semibold text-black mb-4 uppercase tracking-wider';
const contactLinkClasses = 'text-amber-800 hover:text-black transition-colors duration-200';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-black p-8 md:p-12 lg:p-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Main Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Know Your Jewellery */}
          <div className="col-span-1 md:col-span-1">
            <h3 className={titleClasses}>Know Your Jewellery</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className={linkClasses}>Diamond guide</a></li>
              <li><a href="#" className={linkClasses}>Jewellery guide</a></li>
              <li><a href="#" className={linkClasses}>Gemstones guide</a></li>
              <li><a href="#" className={linkClasses}>Gold rate</a></li>
              <li><a href="#" className={linkClasses}>Treasure chest</a></li>
              <li><a href="#" className={linkClasses}>Glossary</a></li>
            </ul>
          </div>

          {/* jewelmarket Advantage */}
          <div className="col-span-1 md:col-span-1">
            <h3 className={titleClasses}>jewelmarket Advantage</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/shop/product/" className={linkClasses}>15-day returns</a></li>
              <li><a href="#" className={linkClasses}>Free shipping</a></li>
              <li><a href="#" className={linkClasses}>Postcards</a></li>
              <li><a href="#" className={linkClasses}>Gold exchange</a></li>
              <li><a href="#" className={linkClasses}>Wearyourwins</a></li>
              <li><a href="#" className={linkClasses}>Gift cards</a></li>
              <li><a href="#" className={linkClasses}>Digital gold</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="col-span-1 md:col-span-1">
            <h3 className={titleClasses}>Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className={linkClasses}>Return policy</a></li>
              <li><a href="#" className={linkClasses}>Order status</a></li>
            </ul>
          </div>

          {/* About Us */}
          <div className="col-span-1 md:col-span-1">
            <h3 className={titleClasses}>About Us</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className={linkClasses}>Our story</a></li>
              <li><a href="#" className={linkClasses}>Press</a></li>
              <li><a href="#" className={linkClasses}>Blog</a></li>
              <li><a href="#" className={linkClasses}>Careers</a></li>
            </ul>
          </div>

          {/* Contact Us & Address (Spans 2 columns on medium screens) */}
          <div className="col-span-2 md:col-span-2">
            <h3 className={titleClasses}>Contact Us</h3>
            <address className="not-italic text-sm mb-6">
              **jewelmarket Trading Pvt Ltd**<br />
              xyz address, 123456.
            </address>

            <h4 className="text-sm font-semibold mb-2">24X7 ENQUIRY SUPPORT ( ALL DAYS )</h4>
            <div className="text-sm space-y-1 mb-6">
              <p>General : <a href="mailto:contactus@jewelmarket.com" className={contactLinkClasses}>contactus@jewelmarket.com</a></p>
              <p>Corporate : <a href="mailto:b2b@jewelmarket.com" className={contactLinkClasses}>b2b@jewelmarket.com</a></p>
              <p>HR : <a href="mailto:careers@jewelmarket.com" className={contactLinkClasses}>careers@jewelmarket.com</a></p>
              <p>Grievance : <a href="#" className={contactLinkClasses}>click here</a></p>
            </div>
            
            {/* Contact Icons */}
            <div className="flex space-x-6 mb-8">
      <div className="flex flex-col items-center text-xs text-amber-800">
        <Phone className="w-6 h-6 mb-1" />
        Call Us
      </div>
      <div className="flex flex-col items-center text-xs text-amber-800">
        <MessageCircle className="w-6 h-6 mb-1" />
        Chat
      </div>
      <div className="flex flex-col items-center text-xs text-amber-800">
        <Mail className="w-6 h-6 mb-1" />
        Email
      </div>
    </div>

            {/* Find a Store Button */}
            <button className="w-full md:w-auto px-6 py-2 border-2 border-amber-800 text-amber-800 font-medium text-sm hover:bg-amber-800 hover:text-white transition-colors duration-200">
                Explore our STORE
            </button>
          </div>
        </div>

        {/* --- Separator --- */}
        <hr className="my-8 border-gray-200" />
        
        {/* Download App & Social Media / Payment */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            
            {/* Download App Section (Simulated Purple Box) */}
            <div className="p-6 mb-8 lg:mb-0 max-w-sm w-full" style={{ background: `linear-gradient(to right, #ffffff, rgba(251, 191, 36, 0.1))`, border: '1px solid #FCD34D' }}>
                <p className="text-base font-semibold mb-3">Download the App</p>
                <p className="text-sm mb-4">Shop & Save more on app by redeeming vCLusive points</p>
                <div className="flex space-x-3">
                    <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-10" /></a>
                    <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10" /></a>
                </div>
            </div>
            
            {/* Find Us On & Payment Methods */}
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-12 w-full lg:w-auto justify-between">
                
                {/* Social Media Icons */}
                <div className="flex items-center space-x-4">
                    <p className="text-sm font-semibold">Find Us On</p>
                    <div className="flex space-x-2">
                        {/* Use simple circles with a deep amber background for the icons */}
                        {['Insta', 'FB', 'LinkedIn', 'Pinterest', 'X'].map((platform) => (
                            <a key={platform} href="#" className="w-8 h-8 rounded-full bg-amber-800 flex items-center justify-center text-white hover:bg-black transition-colors duration-200 text-xs font-bold">
                                {platform[0]}
                            </a>
                        ))}
                    </div>
                </div>
                
                {/* Payment Icons (Text placeholder) */}
                <div className="text-xs text-gray-500 flex space-x-4">
                    <span>VISA</span>
                    <span>PayPal</span>
                    <span>AMEX</span>
                    <span>Amazon</span>
                    <span>Rupay</span>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;