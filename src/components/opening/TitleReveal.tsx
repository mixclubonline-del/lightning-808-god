import { memo } from 'react';
import { Zap } from 'lucide-react';
import { DeityVoiceVisualizer } from '../DeityVoiceVisualizer';

interface TitleRevealProps {
  isVisible: boolean;
  audioData: Uint8Array | null;
  isSpeaking: boolean;
}

export const TitleReveal = memo(({ isVisible, audioData, isSpeaking }: TitleRevealProps) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-30"
      style={{
        animation: 'title-grand-reveal 2s ease-out forwards',
      }}
    >
      {/* Circular glow behind title */}
      <div 
        className="absolute inset-0 -inset-x-20 -inset-y-20"
        style={{
          background: 'radial-gradient(circle at center, hsla(0, 84%, 60%, 0.3) 0%, transparent 60%)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
      />

      {/* Voice visualizer integrated */}
      {isSpeaking && (
        <div className="absolute inset-0 -inset-x-32 flex items-center justify-center opacity-40 pointer-events-none">
          <DeityVoiceVisualizer
            audioData={audioData}
            color="hsl(0, 84%, 60%)"
            accentColor="hsl(25, 95%, 53%)"
            isActive={isSpeaking}
            className="w-full h-48"
          />
        </div>
      )}

      {/* Main title */}
      <h1 
        className="relative text-7xl md:text-9xl font-bold tracking-[0.3em] text-primary mb-6"
        style={{
          fontFamily: 'Georgia, serif',
          textShadow: `
            0 0 40px hsla(0, 84%, 60%, 0.8),
            0 0 80px hsla(0, 84%, 60%, 0.4),
            0 0 120px hsla(0, 84%, 60%, 0.2),
            0 4px 0 hsla(0, 50%, 30%, 1)
          `,
        }}
      >
        VST GOD
      </h1>

      {/* Subtitle */}
      <p 
        className="relative text-2xl md:text-3xl text-foreground/90 tracking-[0.2em] mb-8"
        style={{
          fontFamily: 'Georgia, serif',
          textShadow: '0 0 30px hsla(0, 0%, 100%, 0.5)',
          animation: 'subtitle-fade 1s ease-out 0.5s both',
        }}
      >
        Divine Sound Design
      </p>

      {/* Decorative elements */}
      <div 
        className="flex items-center justify-center gap-6"
        style={{
          animation: 'decorations-appear 1s ease-out 1s both',
        }}
      >
        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        <Zap 
          className="w-8 h-8 text-primary drop-shadow-[0_0_10px_hsla(0,84%,60%,0.8)]" 
          fill="currentColor" 
        />
        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      {/* Greek pattern underline */}
      <div 
        className="mt-6 flex justify-center gap-2"
        style={{
          animation: 'decorations-appear 1s ease-out 1.2s both',
        }}
      >
        {[...Array(7)].map((_, i) => (
          <div 
            key={i}
            className="w-3 h-3 border border-primary/50 rotate-45"
            style={{
              animationDelay: `${1.2 + i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes title-grand-reveal {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
            filter: blur(20px);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(0);
          }
        }

        @keyframes subtitle-fade {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes decorations-appear {
          0% {
            opacity: 0;
            transform: scaleX(0);
          }
          100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
});

TitleReveal.displayName = 'TitleReveal';
