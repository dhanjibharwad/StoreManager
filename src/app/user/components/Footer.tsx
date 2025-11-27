import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Our Services */}
          <div>
            <h3 className="text-lg font-semibold text-[#4A70A9] mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Online Support</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Technical & On-site</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Electrician Support</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Digital Assistance</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Consulting Solutions</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-[#4A70A9] mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Service Request</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Track Service</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Complaint Portal</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-[#4A70A9] mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Our Team</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#4A70A9] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-[#4A70A9] mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#4A70A9] mt-0.5 flex-shrink-0" />
                <span>Union Service Center<br />123 Tech Street, City 12345</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#4A70A9]" />
                <a href="tel:+1234567890" className="hover:text-[#4A70A9] transition-colors">+1 (234) 567-890</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#4A70A9]" />
                <a href="mailto:support@union.com" className="hover:text-[#4A70A9] transition-colors">support@union.com</a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#4A70A9] mt-0.5" />
                <span>24/7 Support Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Contact Icons */}
            <div className="flex space-x-8">
              <div className="flex flex-col items-center text-xs text-[#4A70A9] hover:text-[#365a8a] transition-colors cursor-pointer">
                <div className="bg-[#4A70A9] p-3 rounded-full text-white mb-2 hover:bg-[#365a8a] transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span>Call Us</span>
              </div>
              <div className="flex flex-col items-center text-xs text-[#4A70A9] hover:text-[#365a8a] transition-colors cursor-pointer">
                <div className="bg-[#4A70A9] p-3 rounded-full text-white mb-2 hover:bg-[#365a8a] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span>Live Chat</span>
              </div>
              <div className="flex flex-col items-center text-xs text-[#4A70A9] hover:text-[#365a8a] transition-colors cursor-pointer">
                <div className="bg-[#4A70A9] p-3 rounded-full text-white mb-2 hover:bg-[#365a8a] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span>Email</span>
              </div>
            </div>

            {/* Service Request Button */}
            <button className="bg-[#4A70A9] hover:bg-[#365a8a] text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Request Service
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>© 2025 Union Service Platform. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Trusted by 10,000+ customers</span>
            <span className="text-[#4A70A9] font-medium">Verified Technicians</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;