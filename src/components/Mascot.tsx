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
    md: 'w-[95px] h-[95px]',
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
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F2C14E"/>
              <stop offset="50%" stopColor="#D99A2B"/>
              <stop offset="100%" stopColor="#B27613"/>
            </linearGradient>
            <linearGradient id="steamerWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F7D382"/>
              <stop offset="100%" stopColor="#D19828"/>
            </linearGradient>
            <linearGradient id="bunBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF"/>
              <stop offset="100%" stopColor="#F7ECD8"/>
            </linearGradient>
            <linearGradient id="shumaiBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF5BD"/>
              <stop offset="100%" stopColor="#F6CA44"/>
            </linearGradient>
            <radialGradient id="cheekPink" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F7B5A6" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#F7B5A6" stopOpacity={0}/>
            </radialGradient>
          </defs>
          <rect width="160" height="160" rx="38" fill="#0E5C4A"/>
          
          {/* Outer Bamboo Steamer Border (Gold) */}
          <circle cx="80" cy="85" r="58" fill="none" stroke="url(#goldGrad)" strokeWidth={4.5}/>
          
          {/* Steamer Grid Pattern lines (Back) */}
          <g stroke="#0A4638" strokeWidth={2.5} strokeLinecap="round" opacity={0.4}>
            <line x1="45" y1="65" x2="115" y2="65"/>
            <line x1="30" y1="85" x2="130" y2="85"/>
            <line x1="35" y1="105" x2="125" y2="105"/>
          </g>

          {/* Steam Wisps (Top) */}
          <g stroke="#88D1B7" strokeWidth={4.5} strokeLinecap="round" fill="none" opacity={0.85}>
            <path d="M62,36 C55,24 67,16 60,8"/>
            <path d="M80,32 C73,20 85,12 78,4"/>
            <path d="M98,36 C91,24 103,16 96,8"/>
          </g>

          {/* Steamer Ring (Front Rim) */}
          <circle cx="80" cy="85" r="54" fill="none" stroke="url(#steamerWood)" strokeWidth={3}/>

          {/* 1. Steamed Bun (ซาลาเปา) - Left */}
          <g>
            <path d="M36,95 C34,74 48,58 66,58 C80,58 88,68 86,88 C84,102 76,108 66,108 C52,108 38,104 36,95 Z" fill="url(#bunBody)" stroke="#DEC59B" strokeWidth={2}/>
            <g fill="none" stroke="#D1B280" strokeWidth={2.5} strokeLinecap="round">
              <path d="M46,74 C52,67 58,65 64,65"/>
              <path d="M64,65 L64,58"/>
              <path d="M76,77 C72,69 68,65 64,65"/>
            </g>
            <circle cx="45" cy="94" r="6" fill="url(#cheekPink)"/>
            <circle cx="75" cy="94" r="6" fill="url(#cheekPink)"/>
            <circle cx="51" cy="86" r="3.5" fill="#3A2E22"/>
            <circle cx="50" cy="84.5" r="1" fill="#FFFFFF"/>
            <circle cx="69" cy="86" r="3.5" fill="#3A2E22"/>
            <circle cx="68" cy="84.5" r="1" fill="#FFFFFF"/>
            <path d="M57,92 C60,95 62,95 65,92" fill="none" stroke="#3A2E22" strokeWidth={2.5} strokeLinecap="round"/>
          </g>

          {/* 2. Shumai (ขนมจีบ) - Right */}
          <g>
            <path d="M80,98 C78,84 86,74 100,74 C112,74 120,84 118,98 C116,108 110,112 100,112 C90,112 82,108 80,98 Z" fill="url(#shumaiBody)" stroke="#E5BD60" strokeWidth={2}/>
            <ellipse cx="100" cy="75" rx="5" ry="3" fill="#E74C3C"/>
            <g stroke="#E5BD60" strokeWidth={1.8} strokeLinecap="round">
              <path d="M88,86 C90,80 92,76 94,76"/>
              <path d="M100,88 L100,77"/>
              <path d="M110,87 C108,81 106,76 104,76"/>
            </g>
            <circle cx="89" cy="96" r="4.5" fill="url(#cheekPink)"/>
            <circle cx="111" cy="96" r="4.5" fill="url(#cheekPink)"/>
            <path d="M92,86 C94,84 96,84 98,86" fill="none" stroke="#3A2E22" strokeWidth={2} strokeLinecap="round"/>
            <path d="M102,86 C104,84 106,84 108,86" fill="none" stroke="#3A2E22" strokeWidth={2} strokeLinecap="round"/>
            <path d="M98,92 C100,95 101,95 103,92" fill="none" stroke="#3A2E22" strokeWidth={2} strokeLinecap="round"/>
          </g>
          
          {/* Chopsticks */}
          <g transform="rotate(-10 80 115)" stroke="#A0522D" strokeWidth={2} strokeLinecap="round">
            <line x1="50" y1="120" x2="110" y2="120"/>
            <line x1="52" y1="124" x2="112" y2="124"/>
          </g>
        </svg>
      </div>
    </div>
  );
};
