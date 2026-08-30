import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const heights = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-definition Vector Falcon Emblem & Car Silhouette */}
      <svg
        viewBox="0 0 520 180"
        className={`${heights[size]} w-auto drop-shadow-sm`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#C59B27" />
            <stop offset="100%" stopColor="#997010" />
          </linearGradient>
          <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* Falcon Head Profile */}
        <g transform="translate(10, 10)">
          {/* Head & Crown Feathers */}
          <path
            d="M 65 15 C 45 15, 20 30, 10 55 C 5 68, 8 78, 2 92 C -1 100, 4 105, 12 98 C 18 92, 22 85, 26 78 C 22 88, 20 102, 28 110 C 32 114, 38 112, 40 105 C 44 95, 45 82, 52 75 C 50 86, 52 98, 60 105 C 64 109, 70 106, 72 98 C 76 82, 75 65, 82 52 C 90 38, 85 22, 65 15 Z"
            fill="url(#goldGrad)"
          />
          {/* Beak */}
          <path
            d="M 75 48 C 88 52, 105 60, 110 72 C 102 74, 92 72, 85 70 C 80 82, 72 90, 62 94 C 70 85, 74 74, 75 62 Z"
            fill="url(#goldGrad)"
          />
          {/* Fierce Eye */}
          <circle cx="58" cy="45" r="7" fill="#ffffff" />
          <circle cx="59" cy="44" r="4" fill="#0f172a" />
          <circle cx="60" cy="43" r="1.5" fill="#ffffff" />
        </g>

        {/* Dynamic Aerodynamic Car Silhouette */}
        <path
          d="M 120 70 C 180 35, 320 30, 480 62 C 450 64, 400 58, 320 54 C 240 50, 160 58, 120 70 Z"
          fill="url(#goldGrad)"
        />
        <path
          d="M 140 85 C 220 55, 340 55, 490 82 C 460 76, 380 68, 290 68 C 200 68, 150 78, 140 85 Z"
          fill="url(#navyGrad)"
        />
        <path
          d="M 130 92 C 155 86, 175 84, 190 92 C 175 95, 150 95, 130 92 Z"
          fill="url(#redGrad)"
        />
        <path
          d="M 440 76 C 470 70, 490 74, 505 88 C 480 82, 460 80, 440 76 Z"
          fill="url(#redGrad)"
        />

        {/* AL SHAHEEN Bold Typography */}
        <text
          x="125"
          y="136"
          fill="#0F1F38"
          fontFamily="'Chakra Petch', 'Plus Jakarta Sans', sans-serif"
          fontWeight="800"
          fontStyle="italic"
          fontSize="48"
          letterSpacing="2"
        >
          AL SHAHEEN
        </text>

        {/* AUTO HUB & Speed Lines */}
        <text
          x="130"
          y="168"
          fill="#DC2626"
          fontFamily="'Chakra Petch', 'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
          fontStyle="italic"
          fontSize="26"
          letterSpacing="4"
        >
          AUTO HUB
        </text>

        {/* Horizontal Speed lines */}
        <rect x="295" y="152" width="215" height="3" fill="#DC2626" rx="1.5" />
        <rect x="295" y="158" width="215" height="3" fill="#DC2626" rx="1.5" />
        <rect x="295" y="164" width="215" height="3" fill="#DC2626" rx="1.5" />
      </svg>

      {showText && (
        <div className="hidden sm:flex flex-col">
          <span className="font-extrabold tracking-tight text-slate-900 leading-none text-lg">
            AL SHAHEEN
          </span>
          <span className="text-xs font-bold text-red-600 tracking-wider">
            AUTO HUB &bull; INSPECTIONS
          </span>
        </div>
      )}
    </div>
  );
};
