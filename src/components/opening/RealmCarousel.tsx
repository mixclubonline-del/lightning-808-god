import { useState, useEffect, useRef } from 'react';
import { Zap, Sun, Flame, Box, Eye, Gauge } from 'lucide-react';
import { mythSounds } from '@/utils/mythologicalSounds';

interface Realm {
  id: string;
  name: string;
  deity: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const realms: Realm[] = [
  {
    id: 'zeus',
    name: 'Zeus Realm',
    deity: 'Zeus',
    icon: <Zap className="w-8 h-8" />,
    color: 'hsl(45, 100%, 60%)',
    gradient: 'from-yellow-500/30 via-amber-400/20 to-transparent',
  },
  {
    id: 'apollo',
    name: 'Apollo Realm',
    deity: 'Apollo',
    icon: <Sun className="w-8 h-8" />,
    color: 'hsl(35, 100%, 55%)',
    gradient: 'from-orange-500/30 via-yellow-400/20 to-transparent',
  },
  {
    id: 'vulcan',
    name: 'Vulcan Realm',
    deity: 'Vulcan',
    icon: <Flame className="w-8 h-8" />,
    color: 'hsl(15, 100%, 55%)',
    gradient: 'from-red-500/30 via-orange-400/20 to-transparent',
  },
  {
    id: 'pandora',
    name: 'Pandora Realm',
    deity: 'Pandora',
    icon: <Box className="w-8 h-8" />,
    color: 'hsl(280, 80%, 60%)',
    gradient: 'from-purple-500/30 via-violet-400/20 to-transparent',
  },
  {
    id: 'oracle',
    name: 'Oracle Realm',
    deity: 'Oracle',
    icon: <Eye className="w-8 h-8" />,
    color: 'hsl(200, 90%, 55%)',
    gradient: 'from-cyan-500/30 via-blue-400/20 to-transparent',
  },
  {
    id: 'hermes',
    name: 'Hermes Realm',
    deity: 'Hermes',
    icon: <Gauge className="w-8 h-8" />,
    color: 'hsl(160, 70%, 50%)',
    gradient: 'from-emerald-500/30 via-teal-400/20 to-transparent',
  },
];

interface RealmCarouselProps {
  isVisible: boolean;
}

export const RealmCarousel = ({ isVisible }: RealmCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const hasPlayedFanfareRef = useRef(false);

  // Play portal fanfare when carousel becomes visible
  useEffect(() => {
    if (isVisible && !hasPlayedFanfareRef.current) {
      mythSounds.playPortalFanfare();
      hasPlayedFanfareRef.current = true;
    }
    
    if (!isVisible) {
      hasPlayedFanfareRef.current = false;
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setActiveIndex(0);
      return;
    }

    // Rapid cycle through realms with flash effect
    const interval = setInterval(() => {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 80);
      
      setActiveIndex((prev) => (prev + 1) % realms.length);
    }, 180); // Fast cycling

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const activeRealm = realms[activeIndex];

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
      style={{
        animation: 'carousel-fade-in 0.3s ease-out',
      }}
    >
      {/* Radial gradient background */}
      <div 
        className={`absolute inset-0 bg-gradient-radial ${activeRealm.gradient}`}
        style={{
          opacity: isFlashing ? 0.8 : 0.4,
          transition: 'opacity 0.08s ease-out',
        }}
      />

      {/* Central realm icon */}
      <div 
        className="relative flex flex-col items-center gap-4"
        style={{
          transform: isFlashing ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.08s ease-out',
        }}
      >
        {/* Glowing icon container */}
        <div 
          className="relative p-6 rounded-full"
          style={{
            backgroundColor: `${activeRealm.color}20`,
            boxShadow: `0 0 60px 20px ${activeRealm.color}40, 0 0 100px 40px ${activeRealm.color}20`,
            color: activeRealm.color,
          }}
        >
          {activeRealm.icon}
          
          {/* Flash overlay */}
          {isFlashing && (
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: activeRealm.color,
                opacity: 0.5,
              }}
            />
          )}
        </div>

        {/* Realm name */}
        <div 
          className="text-center"
          style={{
            color: activeRealm.color,
            textShadow: `0 0 20px ${activeRealm.color}80`,
          }}
        >
          <div className="text-xs tracking-[0.3em] uppercase opacity-60 mb-1">
            Entering
          </div>
          <div className="text-2xl font-light tracking-widest uppercase">
            {activeRealm.name}
          </div>
        </div>
      </div>

      {/* Realm indicator dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {realms.map((realm, index) => (
          <div
            key={realm.id}
            className="w-2 h-2 rounded-full transition-all duration-100"
            style={{
              backgroundColor: index === activeIndex ? realm.color : 'rgba(255,255,255,0.2)',
              boxShadow: index === activeIndex ? `0 0 10px ${realm.color}` : 'none',
              transform: index === activeIndex ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Screen flash effect */}
      {isFlashing && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: activeRealm.color,
            opacity: 0.15,
          }}
        />
      )}

      <style>{`
        @keyframes carousel-fade-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
