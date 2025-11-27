/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Home, 
  ShoppingBag, 
  CalendarDays, 
  ChevronRight,
  ArrowRight,
  Trash,
  Image as LucideImage,
  Play,
  MapPin,
  Calendar,
  Tag,
  Mail,
  Phone,
  User,
  X
} from 'lucide-react';
import { FaArrowRight, FaTrash, FaImage, FaPlay, FaMapMarkerAlt, FaCalendarAlt, FaTag } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '@/lib/authContext';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';

// Add DeleteConfirmationModal component
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  postType 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  postType: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
          {/* <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button> */}
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this {postType} post? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function isVideoUrl(url: string): boolean {
  return !!url.match(/\.(mp4|webm|ogg|mov)$/i);
}

function getPosterImage(mediaUrls: string[]): string | undefined {
  return mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : undefined;
}

function getCategoryDisplayName(categoryType: string | null | undefined): string {
  if (!categoryType) return 'Other';
  
  const categories: Record<string, string> = {
    'electronics': 'Electronics',
    'furniture': 'Furniture',
    'clothing': 'Clothing',
    'books': 'Books',
    'sports': 'Sports',
    'vehicles': 'Vehicles',
    'home_appliances': 'Home Appliances',
    'musical_instruments': 'Musical Instruments',
    'tools': 'Tools',
    'toys': 'Toys',
    'jewelry': 'Jewelry',
    'collectibles': 'Collectibles',
    'art': 'Art',
    'health_beauty': 'Health & Beauty',
    'garden': 'Garden',
    'pet_supplies': 'Pet Supplies',
    'baby_kids': 'Baby & Kids',
    'office_supplies': 'Office Supplies',
    'other': 'Other'
  };
  
  return categories[categoryType] || categoryType.replace(/_/g, ' ');
}

function getConditionDisplayName(conditionType: string | null | undefined): string {
  if (!conditionType) return 'Not Specified';
  
  const conditions: Record<string, string> = {
    'new': 'New',
    'like_new': 'Like New',
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
    'not_specified': 'Not Specified'
  };
  
  return conditions[conditionType] || conditionType.replace(/_/g, ' ');
}

// Intersection Observer Hook
function useIntersectionObserver(ref: React.RefObject<HTMLDivElement | null>, options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
}

// Memoized Rental Card Component
const RentalCard = memo(({ 
  listing, 
  activeMedia, 
  changeActiveMedia, 
  formatDate, 
  confirmDelete,
  isDeleting 
}: { 
  listing: RentalPost;
  activeMedia: Record<string, number>;
  changeActiveMedia: (id: string, index: number) => void;
  formatDate: (date: string) => string;
  confirmDelete: (id: string, type: 'rental' | 'event' | 'buysell') => void;
  isDeleting: boolean;
}) => {
  const currentMediaIndex = activeMedia[listing.id] || 0;
  const currentMediaUrl = listing.media_urls?.[currentMediaIndex] || '';
  const isVideo = isVideoUrl(currentMediaUrl);
  const posterImage = getPosterImage(listing.media_urls || []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1, rootMargin: '100px' });
  
  useEffect(() => {
    if (!isVisible && isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isVisible, isPlaying]);
  
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-100"
    >
      <div className="relative h-48">
        {listing.media_urls && listing.media_urls.length > 0 && isVisible ? (
          <>
            {/* Main media display */}
            {isVideo ? (
              <div className="relative h-full w-full cursor-pointer" onClick={handleVideoClick}>
                <video 
                  ref={videoRef}
                  src={currentMediaUrl} 
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={posterImage}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <FaPlay className="h-4 w-4 text-gray-800 ml-1" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Image
                src={currentMediaUrl}
                alt={listing.title}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            )}
            
            {/* Media count indicator */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full px-2 py-1 flex items-center">
              {listing.media_urls.some(url => isVideoUrl(url)) ? (
                <>
                  {listing.media_urls.filter(url => !isVideoUrl(url)).length > 0 && (
                    <>
                      <FaImage className="h-3 w-3 text-white mr-1" />
                      <span className="text-white text-xs mr-2">
                        {listing.media_urls.filter(url => !isVideoUrl(url)).length}
                      </span>
                    </>
                  )}
                  {listing.media_urls.filter(url => isVideoUrl(url)).length > 0 && (
                    <>
                      <FaPlay className="h-3 w-3 text-white mr-1" />
                      <span className="text-white text-xs">
                        {listing.media_urls.filter(url => isVideoUrl(url)).length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <FaImage className="h-3 w-3 text-white mr-1" />
                  <span className="text-white text-xs">{listing.media_urls.length}</span>
                </>
              )}
            </div>

            {/* Media thumbnails preview */}
            {listing.media_urls.length > 1 && (
              <div className="absolute bottom-2 left-2 right-2 flex space-x-1 overflow-x-auto">
                {listing.media_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className={`w-10 h-10 relative rounded overflow-hidden border-2 ${
                      activeMedia[listing.id] === index ? 'border-green-500' : 'border-white/50'
                    } cursor-pointer transition-all hover:opacity-80`}
                    onClick={() => changeActiveMedia(listing.id, index)}
                  >
                    {isVideoUrl(url) ? (
                      <div className="w-full h-full relative">
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{backgroundImage: `url(${posterImage || ''})`}}
                        ></div>
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaPlay className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={url}
                        alt={`${listing.title} - media ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No media available</p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 truncate">
            {listing.title}
          </h2>
          <div className="text-lg font-bold text-green-600">€ {listing.rent}/mo</div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-2 truncate">
          <FaMapMarkerAlt className="mr-1 text-gray-400" />
          <span>{listing.street}, {listing.city}, {listing.country}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FaCalendarAlt className="mr-1 text-gray-400" />
          <span>Available: {formatDate(listing.available_from)}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
            {listing.property_type.replace('_', ' ')}
          </span>
          <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
            {listing.rooms} {listing.rooms === 1 ? 'room' : 'rooms'}
          </span>
          <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
            {listing.bathrooms} {listing.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
          </span>
          <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
            {listing.furnishing}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <Link
            href={`/user/rental-view?id=${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm"
          >
            View Details
            <FaArrowRight className="ml-1" />
          </Link>
          
          <div className="flex space-x-2">
            <button
              onClick={() => confirmDelete(listing.id, 'rental')}
              disabled={isDeleting}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Delete rental listing"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized Buy/Sell Card Component
const BuySellCard = memo(({ 
  listing, 
  activeMedia, 
  changeActiveMedia, 
  formatDate, 
  confirmDelete,
  isDeleting 
}: { 
  listing: BuySellPost;
  activeMedia: Record<string, number>;
  changeActiveMedia: (id: string, index: number) => void;
  formatDate: (date: string) => string;
  confirmDelete: (id: string, type: 'rental' | 'event' | 'buysell') => void;
  isDeleting: boolean;
}) => {
  const currentMediaIndex = activeMedia[listing.id] || 0;
  const currentMediaUrl = listing.media_urls?.[currentMediaIndex] || '';
  const isVideo = isVideoUrl(currentMediaUrl);
  const posterImage = getPosterImage(listing.media_urls || []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1, rootMargin: '100px' });
  
  useEffect(() => {
    if (!isVisible && isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isVisible, isPlaying]);
  
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-100"
    >
      <div className="relative h-48">
        {listing.media_urls && listing.media_urls.length > 0 && isVisible ? (
          <>
            {/* Main media display */}
            {isVideo ? (
              <div className="relative h-full w-full cursor-pointer" onClick={handleVideoClick}>
                <video 
                  ref={videoRef}
                  src={currentMediaUrl} 
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={posterImage}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <FaPlay className="h-4 w-4 text-gray-800 ml-1" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Image
                src={currentMediaUrl}
                alt={listing.title}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            )}
            
            {/* Media count indicator */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full px-2 py-1 flex items-center">
              {listing.media_urls.some(url => isVideoUrl(url)) ? (
                <>
                  {listing.media_urls.filter(url => !isVideoUrl(url)).length > 0 && (
                    <>
                      <FaImage className="h-3 w-3 text-white mr-1" />
                      <span className="text-white text-xs mr-2">
                        {listing.media_urls.filter(url => !isVideoUrl(url)).length}
                      </span>
                    </>
                  )}
                  {listing.media_urls.filter(url => isVideoUrl(url)).length > 0 && (
                    <>
                      <FaPlay className="h-3 w-3 text-white mr-1" />
                      <span className="text-white text-xs">
                        {listing.media_urls.filter(url => isVideoUrl(url)).length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <FaImage className="h-3 w-3 text-white mr-1" />
                  <span className="text-white text-xs">{listing.media_urls.length}</span>
                </>
              )}
            </div>

            {/* Category badge */}
            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {getCategoryDisplayName(listing.category_type)}
            </div>

            {/* Media thumbnails preview */}
            {listing.media_urls.length > 1 && (
              <div className="absolute bottom-2 left-2 right-2 flex space-x-1 overflow-x-auto">
                {listing.media_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className={`w-10 h-10 relative rounded overflow-hidden border-2 ${
                      activeMedia[listing.id] === index ? 'border-blue-500' : 'border-white/50'
                    } cursor-pointer transition-all hover:opacity-80`}
                    onClick={() => changeActiveMedia(listing.id, index)}
                  >
                    {isVideoUrl(url) ? (
                      <div className="w-full h-full relative">
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{backgroundImage: `url(${posterImage || ''})`}}
                        ></div>
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaPlay className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={url}
                        alt={`${listing.title} - media ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No media available</p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 truncate">
            {listing.title}
          </h2>
          <div className="text-lg font-bold text-blue-600">€ {listing.product_price}</div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-2 truncate">
          <FaMapMarkerAlt className="mr-1 text-gray-400" />
          <span>{listing.city}, {listing.country}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FaTag className="mr-1 text-gray-400" />
          <span>{listing.brand_name || 'Unbranded'} • {getConditionDisplayName(listing.condition_type)}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
            {listing.warranty_type ? listing.warranty_type.replace(/_/g, ' ') : 'No Warranty'}
          </span>
          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
            {listing.deliverypickup_type ? listing.deliverypickup_type.replace(/_/g, ' ') : 'Not Specified'}
          </span>
          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
            {listing.return_possible === "yes" ? "Returns Accepted" : "No Returns"}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <Link
            href={`/user/buysell-view?id=${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View Details
            <FaArrowRight className="ml-1" />
          </Link>
          
          <div className="flex space-x-2">
            <button
              onClick={() => confirmDelete(listing.id, 'buysell')}
              disabled={isDeleting}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Delete listing"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized Event Card Component
const EventCard = memo(({ 
  listing, 
  activeMedia, 
  changeActiveMedia, 
  formatDate, 
  confirmDelete,
  isDeleting 
}: { 
  listing: EventPost;
  activeMedia: Record<string, number>;
  changeActiveMedia: (id: string, index: number) => void;
  formatDate: (date: string) => string;
  confirmDelete: (id: string, type: 'rental' | 'event' | 'buysell') => void;
  isDeleting: boolean;
}) => {
  const currentMediaIndex = activeMedia[listing.id] || 0;
  const currentMediaUrl = listing.media_urls?.[currentMediaIndex] || '';
  const isVideo = isVideoUrl(currentMediaUrl);
  const posterImage = getPosterImage(listing.media_urls || []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef, { threshold: 0.1, rootMargin: '100px' });
  
  useEffect(() => {
    if (!isVisible && isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isVisible, isPlaying]);
  
  const handleVideoClick = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-100"
    >
      <div className="relative h-48">
        {listing.media_urls && listing.media_urls.length > 0 && isVisible ? (
          <>
            {/* Main media display */}
            {isVideo ? (
              <div className="relative h-full w-full cursor-pointer" onClick={handleVideoClick}>
                <video 
                  ref={videoRef}
                  src={currentMediaUrl} 
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={posterImage}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <FaPlay className="h-4 w-4 text-gray-800 ml-1" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Image
                src={currentMediaUrl}
                alt={listing.eventname}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            )}
            
            {/* Media count indicator */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full px-2 py-1 flex items-center">
              {listing.media_urls.some(url => isVideoUrl(url)) ? (
                <>
                  {listing.media_urls.filter(url => !isVideoUrl(url)).length > 0 && (
                    <>
                      <FaImage className="h-3 w-3 text-white mr-1" />
                      <span className="text-white text-xs mr-2">
                        {listing.media_urls.filter(url => !isVideoUrl(url)).length}
                      </span>
                    </>
                  )}
                  {listing.media_urls.filter(url => isVideoUrl(url)).length > 0 && (
                    <>
                      <FaPlay className="h-3 w-3 text-white mr-1" />
                      <span className="text-white text-xs">
                        {listing.media_urls.filter(url => isVideoUrl(url)).length}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <FaImage className="h-3 w-3 text-white mr-1" />
                  <span className="text-white text-xs">{listing.media_urls.length}</span>
                </>
              )}
            </div>

            {/* Media thumbnails preview */}
            {listing.media_urls.length > 1 && (
              <div className="absolute bottom-2 left-2 right-2 flex space-x-1 overflow-x-auto">
                {listing.media_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className={`w-10 h-10 relative rounded overflow-hidden border-2 ${
                      activeMedia[listing.id] === index ? 'border-purple-500' : 'border-white/50'
                    } cursor-pointer transition-all hover:opacity-80`}
                    onClick={() => changeActiveMedia(listing.id, index)}
                  >
                    {isVideoUrl(url) ? (
                      <div className="w-full h-full relative">
                        <div 
                          className="absolute inset-0 bg-cover bg-center" 
                          style={{backgroundImage: `url(${posterImage || ''})`}}
                        ></div>
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaPlay className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={url}
                        alt={`${listing.eventname} - media ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No media available</p>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 truncate">
            {listing.eventname}
          </h2>
          <div className="text-lg font-bold text-purple-600">€ {listing.ticket_price}</div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-2 truncate">
          <FaMapMarkerAlt className="mr-1 text-gray-400" />
          <span>{listing.place}, {listing.city}, {listing.country}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <FaCalendarAlt className="mr-1 text-gray-400" />
          <span>{formatDate(listing.event_from)} - {formatDate(listing.event_to)}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
            {listing.event_type.replace(/_/g, ' ')}
          </span>
          {listing.ticket_numbers > 0 && (
            <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
              {listing.ticket_numbers} tickets
            </span>
          )}
          <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
            {listing.refundable === "yes" ? "Refundable" : "Non-refundable"}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <Link
            href={`/user/event-view?id=${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            View Details
            <FaArrowRight className="ml-1" />
          </Link>
          
          <div className="flex space-x-2">
            <button
              onClick={() => confirmDelete(listing.id, 'event')}
              disabled={isDeleting}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              aria-label="Delete event"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Interfaces for posts

interface RentalPost {
  id: string;
  title: string;
  description: string;
  furnishing: string;
  property_type: string;
  kitchen: number;
  bathrooms: number;
  tenants: number;
  rooms: number;
  city: string;
  street: string;
  country: string;
  rent: number;
  deposit: number;
  available_from: string;
  available_to: string;
  media_urls: string[];
  created_at: string;
}

interface BuySellPost {
  id: string;
  category_type: string;
  title: string;
  description: string;
  brand_name: string;
  condition_type: string;
  return_possible: string;
  warranty_type: string;
  product_price: number;
  deliverypickup_type: string;
  city: string;
  street: string;
  house_number: string;
  country: string;
  pincode: string;
  available_from: string;
  modeofcollection_type: string;
  mobile: string;
  whatsapp: string;
  media_urls: string[];
  created_at: string;
}

interface EventPost {
  id: string;
  eventname: string;
  title: string;
  description: string;
  event_type: string;
  event_from: string;
  event_to: string;
  ticket_numbers: number;
  city: string;
  pincode: string;
  place: string;
  country: string;
  ticket_price: number;
  refundable: string;
  mobile: string;
  whatsapp?: string;
  media_urls: string[];
  created_at: string;
}

interface PostCounts {
  rental: number;
  ecom: number;
  event: number;
}

export default function AdminProfilePage() {
  const { user: currentUser, logout } = useAuth();
  const router = useRouter();

  // State for posts and media
  const [rentalPosts, setRentalPosts] = useState<RentalPost[]>([]);
  const [buySellPosts, setBuySellPosts] = useState<BuySellPost[]>([]);
  const [eventPosts, setEventPosts] = useState<EventPost[]>([]);
  const [postCounts, setPostCounts] = useState<PostCounts>({
    rental: 0,
    ecom: 0,
    event: 0
  });
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{[key: string]: number}>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    postId: string;
    postType: 'rental' | 'event' | 'buysell';
  }>({
    isOpen: false,
    postId: '',
    postType: 'rental'
  });

  // Fetch user posts
  const fetchUserPosts = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Fetch rental posts
      const rentalResponse = await supabase
        .from('rental_properties')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      // Fetch buy/sell posts
      const buySellResponse = await supabase
        .from('buysell_products')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      // Fetch event posts
      const eventResponse = await supabase
        .from('event_details')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      // Set posts
      setRentalPosts(rentalResponse.data || []);
      setBuySellPosts(buySellResponse.data || []);
      setEventPosts(eventResponse.data || []);

      // Set post counts
      setPostCounts({
        rental: rentalResponse.data?.length || 0,
        ecom: buySellResponse.data?.length || 0,
        event: eventResponse.data?.length || 0
      });

      // Initialize active media
      const initialActiveMedia: {[key: string]: number} = {};
      [
        ...rentalResponse.data || [], 
        ...buySellResponse.data || [], 
        ...eventResponse.data || []
      ].forEach(post => {
        initialActiveMedia[post.id] = 0;
      });
      setActiveMedia(initialActiveMedia);

    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Change active media for a post
  const changeActiveMedia = (postId: string, mediaIndex: number) => {
    setActiveMedia(prev => ({
      ...prev,
      [postId]: mediaIndex
    }));
  };

  // Update confirmDelete function
  const confirmDelete = (postId: string, postType: 'rental' | 'event' | 'buysell') => {
    setDeleteModal({
      isOpen: true,
      postId,
      postType
    });
  };

  // Add handleDelete function
  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const { postId, postType } = deleteModal;

      // Log the details before deletion attempt
      console.log(`Attempting to delete ${postType} post with ID:`, postId);

      let response;
      switch(postType) {
        case 'rental':
          response = await supabase
            .from('rental_properties')
            .delete()
            .eq('id', postId)
            .select(); // Add select to get more detailed response
          break;
        case 'event':
          response = await supabase
            .from('event_details')
            .delete()
            .eq('id', postId)
            .select(); // Add select to get more detailed response
          break;
        case 'buysell':
          response = await supabase
            .from('buysell_products')
            .delete()
            .eq('id', postId)
            .select(); // Add select to get more detailed response
          break;
      }

      // Comprehensive error logging
      console.log(`Supabase ${postType} deletion response:`, {
        data: response.data,
        error: response.error,
        status: response.status,
        statusText: response.statusText
      });

      // Detailed error handling
      if (response.error) {
        console.error(`Detailed Supabase deletion error for ${postType}:`, {
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint,
          code: response.error.code
        });
        throw response.error;
      }

      // Verify deletion
      if (response.status !== 204 && response.status !== 200) {
        console.warn(`Unexpected response status: ${response.status}`);
        throw new Error(`Deletion failed with status ${response.status}`);
      }

      // Remove the deleted post from state
      switch(postType) {
        case 'rental':
          setRentalPosts(prev => prev.filter(post => post.id !== postId));
          break;
        case 'event':
          setEventPosts(prev => prev.filter(post => post.id !== postId));
          break;
        case 'buysell':
          setBuySellPosts(prev => prev.filter(post => post.id !== postId));
          break;
      }

      // Update post counts
      setPostCounts(prev => ({
        ...prev,
        [postType === 'buysell' ? 'ecom' : postType]: prev[postType === 'buysell' ? 'ecom' : postType] - 1
      }));

      toast.success(`${postType.charAt(0).toUpperCase() + postType.slice(1)} post deleted successfully`);
    } catch (error: unknown) {
      // Enhanced error logging
      console.error(`Comprehensive deletion error for ${deleteModal.postType}:`, {
        error,
        name: error instanceof Error ? error.name : 'Unknown Error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: error instanceof Error ? error.stack : 'No stack trace available'
      });

      // More informative error toast
      toast.error(`Failed to delete ${deleteModal.postType} post. ${
        error instanceof Error ? error.message : 'Please try again.'
      }`);
    } finally {
      setIsDeleting(false);
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [currentUser]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to handle admin logout
  const handleAdminLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Get the admin auth token from localStorage
      const token = localStorage.getItem('adminAuthToken');
      
      if (token) {
        // Call the admin logout API to remove the session from database
        await fetch(`/api/admin/login?token=${token}`, {
          method: 'DELETE',
        });
        
        // Remove admin token from localStorage
        localStorage.removeItem('adminAuthToken');
        
        // Clear admin session cookie
        document.cookie = 'adminAuthToken=; path=/; max-age=0; SameSite=Lax';
      }
      
      // Redirect to admin login page
      router.push('/vendor/login');
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };

  if (!currentUser) {
    router.push('/vendor/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  // Rest of the component remains the same as in the previous implementation
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button 
              onClick={() => router.push('/vendor/adminpanel')} 
              className="hover:text-gray-900 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Admin Profile</span>
          </nav>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden mb-6">
          {/* Profile Header */}
          <div className="p-6 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl mr-4">
                {currentUser.name?.charAt(0)?.toUpperCase() || currentUser.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentUser.name || 'Admin User'}</h2>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  currentUser.role === 'superadmin' ? 'bg-indigo-100 text-indigo-800' :
                  currentUser.role === 'rentaladmin' ? 'bg-green-100 text-green-800' :
                  currentUser.role === 'eventadmin' ? 'bg-purple-100 text-purple-800' :
                  currentUser.role === 'ecomadmin' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentUser.role || 'Admin'}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={(e) => {
                  handleAdminLogout(e);
                }} 
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-gray-600">Email</span>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-gray-600">Phone</span>
                    <p className="font-medium">{currentUser.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-gray-600">Verification Status</span>
                    <div className="flex space-x-3">
                      <span className={`inline-flex items-center ${currentUser.is_email_verified ? 'text-green-600' : 'text-red-600'}`}>
                        Email: {currentUser.is_email_verified ? ' Verified' : 'Not Verified'}
                      </span>
                      <span className={`inline-flex items-center ${currentUser.is_phone_verified ? 'text-green-600' : 'text-red-600'}`}>
                        Phone: {currentUser.is_phone_verified ? ' Verified' : 'Not Verified'} 
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-6 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-900">My Posts</h2>
            <div className="flex space-x-4 mt-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Rental: {postCounts.rental}
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Buy/Sell: {postCounts.ecom}
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                Events: {postCounts.event}
              </div>
            </div>
          </div>

          {/* <div className="my-8 space-y-10 p-4">
                {/* Rental Posts 
                {rentalPosts.length > 0 && (
                    <div id="rental-posts" className="space-y-4 scroll-mt-8">
                        <div className="flex items-start border-b py-2">
                            <div className="p-2 bg-green-50 rounded-lg mr-3">
                                <Home className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Rental Posts</h2>
                                <p className="text-sm text-gray-500 mt-1">Total {postCounts.rental} rental listings</p>
                            </div>
                        </div>

                        <h3 className="text-md font-medium text-gray-700 pb-2">Rental Listings</h3>

                        {!rentalPosts.length ? (
                            <div className="text-center py-8">
                                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No rental posts found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rentalPosts.map((listing) => (
                                    <RentalCard
                                        key={listing.id}
                                        listing={listing}
                                        activeMedia={activeMedia}
                                        changeActiveMedia={changeActiveMedia}
                                        formatDate={formatDate}
                                        confirmDelete={confirmDelete}
                                        isDeleting={isDeleting}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Event Posts 
                {eventPosts.length > 0 && (
                    <div id="event-posts" className="space-y-4 scroll-mt-8">
                        <div className="flex items-start border-b py-2">
                            <div className="p-2 bg-purple-50 rounded-lg mr-3">
                                <CalendarDays className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Event Posts</h2>
                                <p className="text-sm text-gray-500 mt-1">Total {postCounts.event} event listings</p>
                            </div>
                        </div>

                        <h3 className="text-md font-medium text-gray-700 pb-2">Event Listings</h3>

                        {!eventPosts.length ? (
                            <div className="text-center py-8">
                                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No event posts found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {eventPosts.map((listing) => (
                                    <EventCard
                                        key={listing.id}
                                        listing={listing}
                                        activeMedia={activeMedia}
                                        changeActiveMedia={changeActiveMedia}
                                        formatDate={formatDate}
                                        confirmDelete={confirmDelete}
                                        isDeleting={isDeleting}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Buy/Sell Posts 
                {buySellPosts.length > 0 && (
                    <div id="buysell-posts" className="space-y-4 scroll-mt-8">
                        <div className="flex items-start border-b py-2">
                            <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                <ShoppingBag className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Buy/Sell Posts</h2>
                                <p className="text-sm text-gray-500 mt-1">Total {postCounts.ecom} buy/sell listings</p>
                            </div>
                        </div>

                        <h3 className="text-md font-medium text-gray-700 pb-2">Buy/Sell Listings</h3>

                        {!buySellPosts.length ? (
                            <div className="text-center py-8">
                                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No buy/sell posts found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {buySellPosts.map((listing) => (
                                    <BuySellCard
                                        key={listing.id}
                                        listing={listing}
                                        activeMedia={activeMedia}
                                        changeActiveMedia={changeActiveMedia}
                                        formatDate={formatDate}
                                        confirmDelete={confirmDelete}
                                        isDeleting={isDeleting}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* No posts available message for specific admin roles 
                {!rentalPosts.length && !buySellPosts.length && !eventPosts.length && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-lg">No listings available.</p>
                    </div>
                )}
            </div> */}
        </div>
      </div>
      
      {/* Add DeleteConfirmationModal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        postType={deleteModal.postType}
      />
    </div>
  );
}