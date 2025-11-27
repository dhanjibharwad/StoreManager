"use client";

import Image from "next/image";
import { Ruler, BedDouble, Bath } from "lucide-react";

const favorites = [
  {
    id: 1,
    image: "/images/img1.png",
    address: "10765 Hillshire Ave, Baton Rouge, LA 70810, USA",
    sqft: 8000,
    beds: 4,
    baths: 4,
    price: "$5000",
    rating: 5.0,
    reviews: 30,
  },
  {
    id: 2,
    image: "/images/img2.jpg",
    address: "59345 STONEWALL DR, Plaquemine, LA 70764, USA",
    sqft: 8000,
    beds: 4,
    baths: 4,
    price: "$5000",
    rating: 5.0,
    reviews: 30,
  },
  {
    id: 3,
    image: "/images/img3.png",
    address: "3723 SANDBAR DR, Addis, LA 70710, USA",
    sqft: 8000,
    beds: 4,
    baths: 4,
    price: "$5000",
    rating: 5.0,
    reviews: 30,
  },
  {
    id: 4,
    image: "/images/img4.jpg",
    address: "Lot 21 ROYAL OAK DR, Prairieville, LA 70769, USA",
    sqft: 8000,
    beds: 4,
    baths: 4,
    price: "$5000",
    rating: 5.0,
    reviews: 30,
  },
  {
    id: 5,
    image: "/images/img5.jpg",
    address: "5501 River Rd, New Orleans, LA 70123, USA",
    sqft: 7500,
    beds: 4,
    baths: 3,
    price: "$4800",
    rating: 4.9,
    reviews: 25,
  },
  {
    id: 6,
    image: "/images/img6.jpg",
    address: "2509 Elysian Fields, New Orleans, LA 70117, USA",
    sqft: 7200,
    beds: 3,
    baths: 2,
    price: "$4700",
    rating: 4.8,
    reviews: 22,
  },
  {
    id: 7,
    image: "/images/img7.jpg",
    address: "123 Magnolia St, Lafayette, LA 70506, USA",
    sqft: 8200,
    beds: 5,
    baths: 4,
    price: "$5100",
    rating: 4.7,
    reviews: 28,
  },
  {
    id: 8,
    image: "/images/img8.jpg",
    address: "7845 Cypress Bend, Shreveport, LA 71105, USA",
    sqft: 8600,
    beds: 4,
    baths: 4,
    price: "$5300",
    rating: 4.9,
    reviews: 29,
  },
];

export default function FavoritePropertiesPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Favorite Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow border flex overflow-hidden hover:shadow-lg transition"
          >
            <div className="relative w-1/3 h-48">
              <Image
                src={item.image}
                alt="Favorite"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">
                {item.address}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4 text-green-600" /> {item.sqft}sqf
                </div>
                <div className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4 text-green-600" /> {item.beds} Beds
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-green-600" /> {item.baths} Baths
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-medium text-black">{item.price}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rating</p>
                  <p>
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="text-black font-medium ml-1">
                      {item.rating.toFixed(1)}({item.reviews})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
