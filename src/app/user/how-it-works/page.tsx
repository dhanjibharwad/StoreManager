"use client";

import React from "react";
import Link from "next/link";
import { FaFileAlt, FaUserCheck, FaBell, FaWrench, FaStar } from 'react-icons/fa';

export default function DocumentationPage() {
  const steps = [
    {
      icon: <FaFileAlt className="h-8 w-8 text-white" />,
      title: "Customer Query Submission",
      description: "Customers visit our platform and submit their electrical issues through a simple query form. They can describe the problem, attach details, and provide their contact information.",
    },
    {
      icon: <FaUserCheck className="h-8 w-8 text-white" />,
      title: "Admin Review & Assignment",
      description: "Once the query is received, the admin reviews the request and assigns it to the most suitable technician based on expertise and location.",
    },
    {
      icon: <FaBell className="h-8 w-8 text-white" />,
      title: "Technician Notification",
      description: "The assigned technician receives the details of the issue through their portal. They can view the customer’s information, location, and the nature of the electrical problem.",
    },
    {
      icon: <FaWrench className="h-8 w-8 text-white" />,
      title: "On-Site Visit & Resolution",
      description: "The technician visits the customer’s location, diagnoses the issue, and resolves it efficiently. Updates are logged into the system for tracking and transparency.",
    },
    {
      icon: <FaStar className="h-8 w-8 text-white" />,
      title: "Feedback & Closure",
      description: "After completion, the customer can provide feedback on the service. The admin closes the query once the customer is satisfied, ensuring accountability and quality service delivery.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header Section */}
      <header className="relative bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            How Store Manager Works
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            A step-by-step guide on how Store Manager helps customers resolve
            electrical issues through our platform.
          </p>
        </div>
      </header>

      {/* Main Content - Timeline */}
      <main className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-9 sm:left-1/2 top-0 h-full w-0.5 bg-gray-200"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative mb-12 flex items-center w-full">
                {/* Icon and Step Number */}
                <div className={`absolute left-9 sm:left-1/2 transform -translate-x-1/2 flex items-center justify-center`}>
                  <div className="z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 shadow-lg ring-4 ring-gray-50">
                    {step.icon}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-1/2 ${index % 2 === 0 ? 'sm:pr-16' : 'sm:pl-16 sm:ml-auto'}`}>
                  <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 ${index % 2 === 0 ? 'ml-20 sm:ml-0' : 'ml-20 sm:ml-0'}`}>
                    <div className="flex items-baseline mb-2">
                      <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        Step {index + 1}
                      </span>
                      <h3 className="ml-3 text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Have an Issue?
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Let us help you resolve it. Submit your query now and get connected with a professional technician.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/user/complaint">
              <button className="px-8 py-3 rounded-lg bg-gray-800 text-white font-semibold shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-105 cursor-pointer">
                Submit a Query
              </button>
            </Link>
            <Link href="/user/contact">
              <button className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 hover:border-gray-400 transition cursor-pointer">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
