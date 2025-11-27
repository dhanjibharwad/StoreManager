"use client";

import Link from "next/link";
import { Building2, Users, Activity, Shield, Zap, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CompanyInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-600 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-medium">Next-Gen Business Management</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transform Your Business
              <span className="block bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 bg-clip-text text-transparent">
                Operations Today
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
              A unified platform designed to streamline your entire workforce — from Admin oversight to Technician execution, Receptionist coordination, and User engagement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register-company"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/user/home">
              <button className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300">
                Visit Portal
              </button>
              </Link>
            </div>
            
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky-400" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Active Companies", value: "25+", icon: Building2 },
              { label: "Team Members", value: "500+", icon: Users },
              { label: "Technicians", value: "100+", icon: Activity },
              { label: "Uptime", value: "99.9%", icon: TrendingUp },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-sky-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for modern businesses that demand efficiency, security, and scalability
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                title: "Company Admin Dashboard",
                desc: "Comprehensive oversight with real-time analytics, user management, and automated reporting. Make data-driven decisions with intuitive visualizations.",
                icon: Shield,
              },
              {
                title: "Technician Panel",
                desc: "Streamlined job management with mobile-first design. Update statuses, attach photos, and communicate instantly with your team.",
                icon: Activity,
              },
              {
                title: "Receptionist Console",
                desc: "Effortless customer registration and task assignment. Smart scheduling tools ensure optimal resource allocation and quick turnaround.",
                icon: Users,
              },
              {
                title: "User Portal",
                desc: "Self-service portal for end-users to submit requests, track progress, and receive notifications. Enhance customer satisfaction effortlessly.",
                icon: Zap,
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-sky-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400 to-sky-600 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500"></div>
                
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl mb-5 shadow-lg">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
                
                {/* <div className="mt-6 flex items-center text-sky-600 font-semibold group-hover:gap-2 transition-all duration-300">
                  Learn more
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Leading Companies Choose Us
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join thousands of businesses that have transformed their operations with our cutting-edge management platform.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    title: "Centralized Control",
                    desc: "Single dashboard for complete visibility across all departments and operations.",
                  },
                  {
                    title: "Role-Based Security",
                    desc: "Granular permissions ensure data integrity and compliance with industry standards.",
                  },
                  {
                    title: "Enterprise Scalability",
                    desc: "Cloud-native architecture that grows with your business, from startup to enterprise.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-600 rounded-3xl transform rotate-3 opacity-20"></div>
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80"
                alt="Modern office workspace"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-sky-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Join forward-thinking companies that are revolutionizing their operations. Start your free trial today — no credit card required.
          </p>
          
          <Link
            href="/register-company"
            className="group inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-50 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            Register Your Company
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          
          <p className="mt-8 text-sm text-gray-400">
            Get started in minutes. No setup fees. Cancel anytime.
          </p>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 50px) scale(1.05);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}