import React from 'react';

interface CloudTechLogoProps {
  variant?: 'full' | 'compact' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  inverted?: boolean;
}

export const CloudTechLogo: React.FC<CloudTechLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  inverted = false,
}) => {
  // Brand colors:
  // Deep Royal Blue: #073DBB
  // Electric Blue: #087BEF
  // Bright Cyan: #00D5E8
  // Dark Charcoal: #111827
  // White: #FFFFFF

  const iconSizes = {
    sm: { width: 32, height: 26 },
    md: { width: 44, height: 36 },
    lg: { width: 60, height: 48 },
    xl: { width: 84, height: 68 },
  };

  const { width, height } = iconSizes[size];

  const cloudIcon = (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform hover:scale-105 duration-200"
    >
      <defs>
        <linearGradient id="cloudTechGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#073DBB" />
          <stop offset="50%" stopColor="#087BEF" />
          <stop offset="100%" stopColor="#00D5E8" />
        </linearGradient>
        <linearGradient id="cloudTechAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D5E8" />
          <stop offset="100%" stopColor="#087BEF" />
        </linearGradient>
      </defs>
      
      {/* Outer flowing abstract cloud curves */}
      <path
        d="M 28 64 C 15 64 6 54 6 42 C 6 31 14 22 25 21 C 29 11 40 4 52 4 C 67 4 79 14 82 27 C 89 28 94 34 94 42 C 94 51 86 60 76 61"
        stroke="url(#cloudTechGrad)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Inner flowing swoosh accent */}
      <path
        d="M 22 46 C 22 36 29 28 40 28 C 48 28 54 33 56 39 C 60 39 65 43 65 48 C 65 53 60 57 54 57 L 26 57"
        stroke="url(#cloudTechAccent)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Tech pulse dot */}
      <circle cx="70" cy="54" r="3.5" fill="#00D5E8" />
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{cloudIcon}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {cloudIcon}
        <div className="flex flex-col leading-none">
          <span
            className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#073DBB] via-[#087BEF] to-[#00D5E8] bg-clip-text text-transparent"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            CloudTech
          </span>
          <span
            className={`text-[9px] font-semibold tracking-wider uppercase ${
              inverted ? 'text-slate-300' : 'text-slate-600'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Rent · Buy · Service
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      {cloudIcon}
      <div className="flex flex-col">
        {/* CloudTech Wordmark */}
        <span
          className={`${
            size === 'sm'
              ? 'text-lg'
              : size === 'md'
              ? 'text-2xl'
              : size === 'lg'
              ? 'text-3xl'
              : 'text-4xl'
          } font-extrabold tracking-tight leading-none bg-gradient-to-r from-[#073DBB] via-[#087BEF] to-[#00D5E8] bg-clip-text text-transparent`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          CloudTech
        </span>

        {/* Suggested Service Descriptor */}
        <div
          className={`flex items-center gap-1.5 mt-1 font-semibold text-xs tracking-wide leading-none ${
            inverted ? 'text-slate-200' : 'text-slate-900'
          }`}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <span>Rent</span>
          <span className="text-[#087BEF] font-bold">·</span>
          <span>Buy</span>
          <span className="text-[#087BEF] font-bold">·</span>
          <span>Service</span>
        </div>

        {/* Supporting Descriptor with cyan accent lines */}
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[1.5px] w-4 bg-gradient-to-r from-transparent to-[#00D5E8]" />
          <span
            className={`text-[10px] font-medium tracking-wider uppercase ${
              inverted ? 'text-cyan-200' : 'text-[#073DBB]'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Laptops & Desktops
          </span>
          <div className="h-[1.5px] w-4 bg-gradient-to-l from-transparent to-[#00D5E8]" />
        </div>
      </div>
    </div>
  );
};
