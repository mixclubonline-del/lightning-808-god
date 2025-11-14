import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RealmTransitionProps {
  currentRealm: string;
  onTransitionComplete?: () => void;
}

export const RealmTransition = ({ currentRealm, onTransitionComplete }: RealmTransitionProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 1.5,
    }));
    setParticles(newParticles);
    setIsVisible(true);

    // Fade out after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      onTransitionComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentRealm, onTransitionComplete]);

  const realmColors = {
    zeus: "rgba(239, 68, 68, 0.8)",
    apollo: "rgba(59, 130, 246, 0.8)",
    vulcan: "rgba(249, 115, 22, 0.8)",
    pandora: "rgba(168, 85, 247, 0.8)",
    oracle: "rgba(6, 182, 212, 0.8)",
    hermes: "rgba(34, 197, 94, 0.8)",
  };

  const realmColor = realmColors[currentRealm as keyof typeof realmColors] || realmColors.zeus;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Fade overlay */}
      <div 
        className="absolute inset-0 animate-fade-in"
        style={{
          background: `radial-gradient(circle at center, ${realmColor}, transparent 70%)`,
          animation: "fade-in 0.6s ease-out forwards, fade-out 0.6s ease-out 0.9s forwards",
        }}
      />

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-0"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            background: realmColor,
            boxShadow: `0 0 ${8 + Math.random() * 12}px ${realmColor}`,
            animation: `particle-fade ${particle.duration}s ease-out ${particle.delay}s forwards`,
          }}
        />
      ))}

      {/* Realm name reveal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="text-6xl font-bold tracking-widest uppercase opacity-0"
          style={{
            fontFamily: 'serif',
            color: realmColor,
            textShadow: `0 0 30px ${realmColor}, 0 0 60px ${realmColor}`,
            animation: "realm-reveal 1.5s ease-out forwards",
          }}
        >
          {currentRealm} REALM
        </div>
      </div>
    </div>
  );
};
