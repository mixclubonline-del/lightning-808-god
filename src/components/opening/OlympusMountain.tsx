import { memo } from 'react';

interface OlympusMountainProps {
  isVisible: boolean;
  showColumns: boolean;
  showGods: boolean;
  className?: string;
}

export const OlympusMountain = memo(({ isVisible, showColumns, showGods, className = '' }: OlympusMountainProps) => {
  if (!isVisible) return null;

  return (
    <div 
      className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl ${className}`}
      style={{
        animation: 'olympus-rise 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}
    >
      {/* Distant mountain range */}
      <svg viewBox="0 0 800 300" className="w-full h-auto opacity-30" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="distantMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 60%, 25%)" />
            <stop offset="100%" stopColor="hsl(0, 40%, 10%)" />
          </linearGradient>
        </defs>
        <path 
          d="M0,300 L100,220 L180,250 L280,180 L350,210 L450,150 L520,190 L620,140 L700,180 L800,160 L800,300 Z" 
          fill="url(#distantMountainGrad)"
        />
      </svg>

      {/* Main Mount Olympus */}
      <svg 
        viewBox="0 0 800 400" 
        className="absolute bottom-0 w-full h-auto"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="olympusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 84%, 50%)" stopOpacity="0.9" />
            <stop offset="30%" stopColor="hsl(0, 70%, 35%)" stopOpacity="0.8" />
            <stop offset="70%" stopColor="hsl(0, 50%, 20%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(0, 40%, 10%)" />
          </linearGradient>
          
          <linearGradient id="peakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 84%, 60%)" />
            <stop offset="50%" stopColor="hsl(0, 70%, 40%)" />
            <stop offset="100%" stopColor="hsl(0, 50%, 25%)" />
          </linearGradient>

          <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(0, 0%, 95%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(0, 0%, 70%)" stopOpacity="0.3" />
          </linearGradient>

          <filter id="mountainGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main mountain body */}
        <path 
          d="M0,400 L150,350 L250,280 L320,220 L380,150 L400,80 L420,150 L480,220 L550,280 L650,350 L800,400 Z" 
          fill="url(#olympusGrad)"
          filter="url(#mountainGlow)"
        />

        {/* Left peak */}
        <path 
          d="M180,400 L250,320 L290,250 L310,180 L330,250 L370,320 L420,400 Z" 
          fill="url(#peakGrad)"
          opacity="0.8"
        />

        {/* Right peak */}
        <path 
          d="M380,400 L430,320 L470,250 L490,180 L510,250 L550,320 L620,400 Z" 
          fill="url(#peakGrad)"
          opacity="0.8"
        />

        {/* Snow caps */}
        <path 
          d="M385,100 L400,50 L415,100 L408,90 L400,95 L392,90 Z" 
          fill="url(#snowGrad)"
        />
        <path 
          d="M300,200 L310,160 L320,200 L315,195 L310,198 L305,195 Z" 
          fill="url(#snowGrad)"
          opacity="0.7"
        />
        <path 
          d="M480,200 L490,160 L500,200 L495,195 L490,198 L485,195 Z" 
          fill="url(#snowGrad)"
          opacity="0.7"
        />

        {/* Temple columns */}
        {showColumns && (
          <g 
            className="opacity-0"
            style={{ animation: 'columns-rise 1s ease-out 0.5s forwards' }}
          >
            {/* Central temple platform */}
            <rect x="360" y="85" width="80" height="8" fill="hsl(0, 20%, 80%)" rx="2" />
            
            {/* Columns */}
            {[370, 385, 400, 415, 430].map((x, i) => (
              <g key={i}>
                <rect x={x} y="40" width="6" height="45" fill="hsl(0, 10%, 85%)" rx="1" />
                {/* Column capital */}
                <rect x={x - 2} y="38" width="10" height="4" fill="hsl(0, 10%, 90%)" rx="1" />
                {/* Column base */}
                <rect x={x - 1} y="83" width="8" height="3" fill="hsl(0, 10%, 75%)" rx="1" />
              </g>
            ))}

            {/* Temple roof */}
            <path d="M355,40 L400,15 L445,40 Z" fill="hsl(0, 60%, 45%)" />
            <path d="M360,40 L400,20 L440,40 Z" fill="hsl(0, 50%, 55%)" />
          </g>
        )}

        {/* God silhouettes */}
        {showGods && (
          <g 
            className="opacity-0"
            style={{ animation: 'gods-appear 1.5s ease-out forwards' }}
          >
            {/* Zeus (center) */}
            <g transform="translate(395, 25)">
              <ellipse cx="5" cy="0" rx="4" ry="5" fill="hsl(0, 84%, 60%)" opacity="0.8" />
              <path d="M0,5 L5,15 L10,5" fill="hsl(0, 84%, 60%)" opacity="0.6" />
              <circle cx="5" cy="0" r="6" fill="none" stroke="hsl(0, 84%, 70%)" strokeWidth="1" opacity="0.4" />
            </g>

            {/* Apollo (left) */}
            <g transform="translate(305, 145)">
              <ellipse cx="4" cy="0" rx="3" ry="4" fill="hsl(45, 90%, 55%)" opacity="0.7" />
              <path d="M0,4 L4,12 L8,4" fill="hsl(45, 90%, 55%)" opacity="0.5" />
            </g>

            {/* Vulcan (right) */}
            <g transform="translate(485, 145)">
              <ellipse cx="4" cy="0" rx="3" ry="4" fill="hsl(25, 95%, 50%)" opacity="0.7" />
              <path d="M0,4 L4,12 L8,4" fill="hsl(25, 95%, 50%)" opacity="0.5" />
            </g>
          </g>
        )}
      </svg>

      {/* Clouds drifting */}
      <div className="absolute bottom-[30%] left-0 w-full overflow-hidden pointer-events-none">
        <div 
          className="flex gap-20 opacity-20"
          style={{ animation: 'cloud-drift 30s linear infinite' }}
        >
          {[...Array(6)].map((_, i) => (
            <svg key={i} viewBox="0 0 200 60" className="w-48 h-auto flex-shrink-0">
              <ellipse cx="100" cy="35" rx="70" ry="20" fill="white" opacity="0.4" />
              <ellipse cx="70" cy="30" rx="40" ry="18" fill="white" opacity="0.5" />
              <ellipse cx="130" cy="28" rx="45" ry="22" fill="white" opacity="0.5" />
              <ellipse cx="100" cy="25" rx="50" ry="20" fill="white" opacity="0.6" />
            </svg>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes olympus-rise {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(100%) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateX(-50%) translateY(-5%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        @keyframes columns-rise {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gods-appear {
          0% {
            opacity: 0;
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes cloud-drift {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
});

OlympusMountain.displayName = 'OlympusMountain';
