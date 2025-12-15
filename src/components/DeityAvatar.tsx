import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { DeityName, DEITY_CONFIG, DeityMood } from '@/types/deity';
import { 
  Zap, Sun, Flame, Box, Eye, Wind,
  Sparkles
} from 'lucide-react';

interface DeityAvatarProps {
  deity: DeityName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: DeityMood;
  isSpeaking?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const DEITY_ICONS: Record<DeityName, React.ElementType> = {
  zeus: Zap,
  apollo: Sun,
  vulcan: Flame,
  pandora: Box,
  oracle: Eye,
  hermes: Wind,
};

export function DeityAvatar({
  deity,
  size = 'md',
  mood = 'welcoming',
  isSpeaking = false,
  isActive = false,
  onClick,
  className,
}: DeityAvatarProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const config = DEITY_CONFIG[deity];
  const Icon = DEITY_ICONS[deity];

  // Animate pulse when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setPulseIntensity(0);
      return;
    }

    const interval = setInterval(() => {
      setPulseIntensity(Math.random() * 0.5 + 0.5);
    }, 100);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-full transition-all duration-300',
        'flex items-center justify-center',
        'border-2 backdrop-blur-sm',
        sizeClasses[size],
        isActive && 'scale-110',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      style={{
        borderColor: config.color,
        background: `radial-gradient(circle at 30% 30%, ${config.accentColor}20, ${config.color}40)`,
        boxShadow: `
          0 0 ${20 + pulseIntensity * 30}px ${config.color}60,
          inset 0 0 ${10 + pulseIntensity * 20}px ${config.accentColor}30
        `,
      }}
    >
      {/* Inner glow ring */}
      <div
        className="absolute inset-2 rounded-full opacity-50"
        style={{
          background: `radial-gradient(circle, ${config.accentColor}40, transparent 70%)`,
          animation: isActive ? 'pulse 2s infinite' : 'none',
        }}
      />

      {/* Icon */}
      <Icon
        className={cn(
          iconSizes[size],
          'relative z-10 transition-all duration-200',
        )}
        style={{
          color: config.accentColor,
          filter: `drop-shadow(0 0 ${8 + pulseIntensity * 12}px ${config.color})`,
        }}
      />

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: config.accentColor,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Active sparkles */}
      {isActive && (
        <Sparkles
          className="absolute -top-2 -right-2 w-5 h-5 animate-pulse"
          style={{ color: config.accentColor }}
        />
      )}
    </button>
  );
}
