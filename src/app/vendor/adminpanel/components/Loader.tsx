import React from 'react';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  // Determine size based on prop
  const dimensions = {
    small: {
      container: 'w-8 h-8',
      svg: 'h-4 w-4'
    },
    medium: {
      container: 'w-10 h-10',
      svg: 'h-5 w-5'
    },
    large: {
      container: 'w-12 h-12',
      svg: 'h-6 w-6'
    }
  };

  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-white px-4" 
    : "flex items-center justify-center py-6";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`inline-flex items-center justify-center ${dimensions[size].container} bg-gray-100 rounded-full mb-3`}>
          <svg 
            className={`animate-spin ${dimensions[size].svg} text-gray-500`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        {text && <p className={`font-medium text-gray-700 ${size === 'small' ? 'text-xs' : 'text-base'}`}>{text}</p>}
      </div>
    </div>
  );
};

export default Loader; 