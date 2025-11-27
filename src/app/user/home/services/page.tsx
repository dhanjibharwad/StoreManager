// src/app/carddetail/page.tsx  (Next.js App Router with TypeScript)
/* eslint-disable */
"use client";
import React from "react";
import Image from "next/image";

interface ProjectCardProps {
  image: string;
  title: string;
  description: string;
}

const projects: ProjectCardProps[] = [
  {
    image: "/images/id1.jpg", // replace with your image path
    title: "Online Support",
    description:
      "24/7 customer chat & call support, Remote troubleshooting, Guidance for software or device setup,Account and billing assistance.",
  },
  {
    image: "/images/id2.jpg",
    title: "Technical & On-site",
    description:
      "Home visits by verified technicians, Hardware installation and repairs, Software troubleshooting and Network setup.",
  },
  {
    image: "/images/id3.jpg",
    title: "Electrician On-site Support",
    description:
      "Installation, repair, and maintenance support, Electrical, electronic, and networking help, Smart device setup and configuration.",
  },
  {
    image: "/images/id4.jpg",
    title: "Digital Assistance",
    description:
      "Help with online applications, registrations, and payments, Document scanning, uploading, and verification.",
  },
  {
    image: "/images/id5.jpg",
    title: "Consulting & Solutions",
    description:
      "Personalized problem-solving assistance, Small business support solutions, Expert consultation for technical issues.",
  },
  {
    image: "/images/id6.png",
    title: "Why Choose Union",
    description:
      "Reliable and professional team, Verified technicians, Affordable and transparent pricing, Customer satisfaction guarantee",
  },
  {
    image: "/images/id7.png",
    title: "Service Areas or Locations",
    description:
      "Mention if services are available locally, regionally, or share your current location to us for nearby support.",
  },
  {
    image: "/images/id8.png",
    title: "Get Help / Contact Us",
    description:
      "Contact form or “Request a Service”, Phone and email support, Live chat option for immediate assistance.",
  },
];3

const CardDetail = () => {
  return (
    <section className="py-16 bg-white">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800">Our Services</h2>
        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
          By offering tools and solutions that streamline communication, manage customer data, and track interactions,
           CRM service providers enable companies to deliver personalized experiences and improve customer satisfaction.
            {/* Their services often include implementation of CRM platforms, customization to fit unique business needs, 
            integration with existing systems, and ongoing support. Ultimately, a reliable CRM service provider empowers
             organizations to increase efficiency, strengthen customer loyalty, and drive sustainable growth. */}
        </p>
      </div>

      {/* Cards */}
      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {projects.map((project, index) => (
          <div
            key={index}
            className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white"
          >
            <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-lg text-gray-800">
                {project.title}
              </h3>
              <p className="mt-2 text-gray-500 text-sm">
                {project.description}
              </p>
              {/* <button className="mt-4 px-5 py-2 bg-gray-800 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-gray-800 transition">
                SEE DETAILS
              </button> */}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardDetail;
