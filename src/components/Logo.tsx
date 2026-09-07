import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Satellite Icon in Rounded Cyan/Blue Container */}
      <div className={`${iconSizes[size]} bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0`}>
        <svg
          className="w-3/5 h-3/5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Main Satellite Body */}
          <rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)" />
          {/* Solar Panels Left & Right */}
          <line x1="4.5" y1="4.5" x2="8.5" y2="8.5" />
          <line x1="15.5" y1="15.5" x2="19.5" y2="19.5" />
          <path d="M3 6l3-3 3 3-3 3z" />
          <path d="M15 18l3-3 3 3-3 3z" />
          {/* Ground Signal Wave */}
          <path d="M4 17c2 2 5 2 7 0" />
        </svg>
      </div>

      {/* TerraVision Blue Theme Typography */}
      <div className={`font-extrabold tracking-tight ${textSizes[size]} flex items-center`}>
        <span className="text-white">Terra</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">Vision</span>
      </div>
    </div>
  );
};
