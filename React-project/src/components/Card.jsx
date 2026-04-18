import React, { useState, useEffect } from 'react';
import specialEdition from '@/assets/images/marketing/empty-gym.webp';

const Card = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  
  useEffect(() => {
    const img = new Image();
    img.src = specialEdition;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      console.error('Failed to load card image');
      setImageError(true);
    };
  }, []);

  const handleLearnMore = () => {
    try {
      
      console.log('Navigating to Our Impact page');
  
    } catch (err) {
      console.error('Navigation error:', err);
      alert('Unable to navigate. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 mt-12 mb-12">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Text Section - Left on desktop */}
          <div className="flex items-center min-h-[400px] p-8 md:p-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Impact
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Everything we do is built around performance, purpose, and progress. We empower people to train harder, 
                live healthier, and reach their full potential backed by quality gear and clean supplements that make real impact.
              </p>
              <button 
                onClick={handleLearnMore}
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 inline-flex items-center"
              >
                Learn More 
                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>

          {/* Image Section - Right on desktop */}
          <div className="relative min-h-[400px] bg-gray-100">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Image unavailable</p>
                </div>
              </div>
            )}

            <img
              src={specialEdition}
              alt="Our Impact - Empty gym interior"
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Card;