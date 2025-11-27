/* eslint-disable */
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface BrandData {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
}

const BrandSlider = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [brandData, setBrandData] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<number | null>(null);
  const [screenWidth, setScreenWidth] = useState(0);

  // Fetch brand data from API
  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const response = await fetch('/api/brandslider');
        
        if (!response.ok) {
          throw new Error('Failed to fetch brand data');
        }
        
        const data = await response.json();
        setBrandData(data.brandSliders || []);
      } catch (err) {
        console.error('Error fetching brand data:', err);
        // Use fallback data if API fails
        // setBrandData([
        //   { id: '1', title: 'Brown Donkey', description: null, image_url: '/api/placeholder/200/100' },
        //   { id: '2', title: 'Baletic', description: null, image_url: '/api/placeholder/200/100' },
        //   { id: '3', title: 'Saltwater', description: null, image_url: '/api/placeholder/200/100' },
        //   { id: '4', title: 'Amishar', description: null, image_url: '/api/placeholder/200/100' },
        //   { id: '5', title: 'Majestic', description: null, image_url: '/api/placeholder/200/100' },
        // ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, []);

  // Track screen width for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate card width based on screen size
  const getCardWidth = useCallback(() => {
    if (screenWidth < 640) return 150; // Small screens
    if (screenWidth < 1024) return 180; // Medium screens
    return 220; // Large screens
  }, [screenWidth]);

  // Pure JS-based infinite scroll implementation
  useEffect(() => {
    if (!brandData.length || !sliderRef.current || !containerRef.current) return;

    const slider = sliderRef.current;
    const cardWidth = getCardWidth();
    let position = 0;
    // Adjust speed based on screen size
    const speed = screenWidth > 1024 ? 1.5 : screenWidth > 640 ? 1 : 0.7;

    // Create enough clones to fill the screen
    const setupClones = () => {
      // Clear existing children first to avoid duplicate clones on resize
      while (slider.firstChild) {
        slider.removeChild(slider.firstChild);
      }

      // Create original items
      brandData.forEach((brand, index) => {
        const item = createBrandCard(brand, index);
        slider.appendChild(item);
      });

      // Calculate how many clones we need to fill the screen
      const containerWidth = containerRef.current?.clientWidth || 1200;
      const itemsNeeded = Math.ceil(containerWidth / cardWidth) * 3; // Triple the needed amount for smooth scrolling
      
      // Clone enough items to fill the screen multiple times
      for (let i = 0; i < itemsNeeded; i++) {
        const brand = brandData[i % brandData.length];
        const clone = createBrandCard(brand, i + brandData.length);
        slider.appendChild(clone);
      }
    };

    // Helper to create brand card DOM element
    function createBrandCard(brand: BrandData, index: number) {
      const div = document.createElement('div');
      div.className = `relative overflow-hidden bg-black/30 bg-cover bg-center cursor-pointer flex-shrink-0 group`;
      div.style.width = `${cardWidth}px`;
      div.style.height = `${cardWidth / 2}px`;
      div.style.backgroundImage = `url('${brand.image_url}')`;

      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-opacity-50 bg-black/50 transform translate-x-0 transition-transform duration-600 group-hover:translate-x-full';
      div.appendChild(overlay);

      const content = document.createElement('div');
      content.className = 'relative z-[2] w-full h-full flex items-end  justify-end text-gray-200 font-georgia text-sm p-2.5 text-center';
      
      const span = document.createElement('span');
      span.textContent = brand.title;
      content.appendChild(span);
      div.appendChild(content);

      return div;
    }

    setupClones();

    // Animation function
    const animate = () => {
      if (!isHovered) {
        position += speed;
        
        // If we've scrolled past one item, reset position and move first item to the end
        if (position >= cardWidth) {
          position = 0;
          
          // Move the first element to the end
          const firstItem = slider.children[0];
          slider.appendChild(firstItem.cloneNode(true));
          slider.removeChild(firstItem);
        }
        
        // Apply the transform
        slider.style.transform = `translateX(-${position}px)`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [brandData, isHovered, screenWidth, getCardWidth]);

  if (loading) {
    return <div className="py-5 text-center">Loading collaborators...</div>;
  }
  
  if (brandData.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="w-full overflow-hidden">
        <div 
          ref={containerRef}
          className="relative w-full overflow-hidden pt-10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          <div 
            ref={sliderRef}
            className="flex"
            style={{ willChange: 'transform' }}
          >
            {/* Cards will be dynamically created in the useEffect */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;