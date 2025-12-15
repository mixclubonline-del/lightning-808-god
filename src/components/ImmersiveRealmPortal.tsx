import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { DeityName, DEITY_CONFIG, getRandomGreeting } from '@/types/deity';
import { DeityAvatar } from './DeityAvatar';
import { mythSounds } from '@/utils/mythologicalSounds';

interface ImmersiveRealmPortalProps {
  targetRealm: DeityName;
  isActive: boolean;
  onTransitionComplete: () => void;
}

export function ImmersiveRealmPortal({
  targetRealm,
  isActive,
  onTransitionComplete,
}: ImmersiveRealmPortalProps) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'deity' | 'entering' | 'complete'>('idle');
  const [greeting, setGreeting] = useState('');
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  const config = DEITY_CONFIG[targetRealm];

  // Generate particles
  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 6,
        delay: Math.random() * 1,
      }));
      setParticles(newParticles);
    }
  }, [isActive]);

  // Typewriter effect for greeting
  useEffect(() => {
    if (phase !== 'deity' || !greeting) return;

    let index = 0;
    setDisplayedGreeting('');

    const interval = setInterval(() => {
      if (index < greeting.length) {
        setDisplayedGreeting(greeting.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phase, greeting]);

  // Transition phases
  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    setPhase('opening');
    setGreeting(getRandomGreeting(targetRealm));
    mythSounds.playRealmTransition();

    const phases = [
      { phase: 'deity' as const, delay: 800 },
      { phase: 'entering' as const, delay: 3500 },
      { phase: 'complete' as const, delay: 4500 },
    ];

    const timeouts = phases.map(({ phase, delay }) =>
      setTimeout(() => setPhase(phase), delay)
    );

    const completeTimeout = setTimeout(() => {
      onTransitionComplete();
    }, 5000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [isActive, targetRealm, onTransitionComplete]);

  if (!isActive && phase === 'idle') return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] overflow-hidden',
        'transition-opacity duration-500',
        phase === 'complete' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
    >
      {/* Background with realm color */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: phase === 'opening'
            ? `radial-gradient(circle at center, ${config.color}80 0%, transparent 0%)`
            : `radial-gradient(circle at center, ${config.color}90 0%, hsl(var(--background)) 100%)`,
          animation: phase === 'opening' ? 'portal-expand 0.8s ease-out forwards' : undefined,
        }}
      />

      {/* Particle field */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: config.accentColor,
              boxShadow: `0 0 ${particle.size * 2}px ${config.accentColor}`,
              opacity: phase === 'entering' ? 0 : 0.8,
              transform: phase === 'entering' ? 'scale(3)' : 'scale(1)',
              transition: `all ${1 + particle.delay}s ease-out`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Central portal ring */}
      <div
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'rounded-full border-4 transition-all duration-1000',
          phase === 'opening' && 'animate-pulse'
        )}
        style={{
          width: phase === 'opening' ? '100px' : phase === 'entering' ? '200vmax' : '400px',
          height: phase === 'opening' ? '100px' : phase === 'entering' ? '200vmax' : '400px',
          borderColor: config.accentColor,
          boxShadow: `
            0 0 60px ${config.color},
            0 0 120px ${config.color}80,
            inset 0 0 60px ${config.accentColor}40
          `,
        }}
      />

      {/* Deity avatar and greeting */}
      {(phase === 'deity' || phase === 'entering') && (
        <div
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'flex flex-col items-center gap-6 transition-all duration-700',
            phase === 'entering' && 'opacity-0 scale-150'
          )}
        >
          <DeityAvatar
            deity={targetRealm}
            size="xl"
            isSpeaking={displayedGreeting.length < greeting.length}
            isActive
          />

          <div className="text-center max-w-md">
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                color: config.accentColor,
                textShadow: `0 0 20px ${config.color}`,
              }}
            >
              {config.name}
            </h2>
            <p
              className="text-lg text-muted-foreground"
              style={{ textShadow: `0 0 10px ${config.color}40` }}
            >
              {config.title}
            </p>

            {/* Greeting with typewriter */}
            <p
              className="mt-6 text-xl italic min-h-[3rem]"
              style={{
                color: config.accentColor,
                textShadow: `0 0 15px ${config.color}60`,
              }}
            >
              "{displayedGreeting}"
              {displayedGreeting.length < greeting.length && (
                <span className="animate-pulse">|</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Realm name reveal during entry */}
      {phase === 'entering' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'fade-in 0.5s ease-out forwards',
          }}
        >
          <h1
            className="text-6xl md:text-8xl font-bold tracking-[0.3em] uppercase"
            style={{
              color: config.accentColor,
              textShadow: `
                0 0 40px ${config.color},
                0 0 80px ${config.color}80,
                0 0 120px ${config.color}60
              `,
              animation: 'realm-zoom 1s ease-out forwards',
            }}
          >
            {config.name} REALM
          </h1>
        </div>
      )}

      <style>{`
        @keyframes portal-expand {
          0% {
            background: radial-gradient(circle at center, ${config.color}80 0%, transparent 0%);
          }
          100% {
            background: radial-gradient(circle at center, ${config.color}90 0%, hsl(var(--background)) 100%);
          }
        }

        @keyframes realm-zoom {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
