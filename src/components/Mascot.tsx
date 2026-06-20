import React from 'react';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
  animate?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  size = 'md',
  message,
  className = '',
  animate = true
}) => {
  // Dimensions based on size
  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Speech Bubble */}
      {message && (
        <div className="relative mb-3 max-w-xs px-4 py-2 text-sm font-medium text-brand-dark bg-white rounded-2xl border-2 border-brand-green/30 shadow-md">
          {message}
          {/* Arrow pointing down */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
          {/* Shadow of the arrow */}
          <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-brand-green/10 -z-10"></div>
        </div>
      )}

      {/* Mascot Graphic (Inline SVG derived from logo-icon.svg but responsive) */}
      <div className={`${dimensions[size]} ${animate ? 'mascot-bounce' : ''} transition-all duration-300`}>
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="ibun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFDF8"/>
              <stop offset="1" stopColor="#F3EBDA"/>
            </linearGradient>
            <radialGradient id="icheek" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#F7B5A6"/>
              <stop offset="1" stopColor="#F7B5A6" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="160" height="160" rx="38" fill="#0E5C4A"/>
          {/* Steam wisps */}
          <g stroke="#7FB9A4" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M58,40 q-7,-11 0,-20 q7,-9 0,-18"/>
            <path d="M80,34 q-7,-11 0,-20 q7,-9 0,-18"/>
            <path d="M102,40 q-7,-11 0,-20 q7,-9 0,-18"/>
          </g>
          {/* Bun body */}
          <circle cx="80" cy="92" r="50" fill="url(#ibun)" stroke="#E6D9BE" strokeWidth="2.5"/>
          {/* Bun creases */}
          <g fill="none" stroke="#E0CFA8" strokeWidth="2.5" strokeLinecap="round">
            <path d="M46,62 q8,-11 17,-16"/>
            <path d="M80,52 l0,-12"/>
            <path d="M114,62 q-8,-11 -17,-16"/>
          </g>
          {/* Cheeks */}
          <circle cx="54" cy="104" r="11" fill="url(#icheek)"/>
          <circle cx="106" cy="104" r="11" fill="url(#icheek)"/>
          {/* Happy eyes */}
          <path d="M52,86 q7,9 14,0" fill="none" stroke="#3A2E22" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M94,86 q7,9 14,0" fill="none" stroke="#3A2E22" strokeWidth="4.5" strokeLinecap="round"/>
          {/* Smiling mouth */}
          <path d="M67,106 q13,15 26,0" fill="none" stroke="#3A2E22" strokeWidth="4.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};
