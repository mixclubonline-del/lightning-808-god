import { memo, useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { DeityVoiceVisualizer } from '../DeityVoiceVisualizer';

interface ProphecyDisplayProps {
  prophecy: string;
  isVisible: boolean;
  audioData: Uint8Array | null;
  isSpeaking: boolean;
}

export const ProphecyDisplay = memo(({ prophecy, isVisible, audioData, isSpeaking }: ProphecyDisplayProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (!isVisible || !prophecy) {
      setDisplayedText('');
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= prophecy.length) {
        setDisplayedText(prophecy.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isVisible, prophecy]);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 text-center z-40"
      style={{
        animation: 'prophecy-appear 1s ease-out forwards',
      }}
    >
      {/* Voice visualizer behind text */}
      {isSpeaking && (
        <div className="absolute inset-0 -top-8 flex items-center justify-center opacity-30 pointer-events-none">
          <DeityVoiceVisualizer
            audioData={audioData}
            color="hsl(0, 84%, 60%)"
            accentColor="hsl(25, 95%, 53%)"
            isActive={isSpeaking}
            className="w-full h-32"
          />
        </div>
      )}

      {/* Decorative frame */}
      <div className="relative">
        {/* Top decoration */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-primary" />
          <Zap className="w-5 h-5 text-primary" fill="currentColor" />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-primary" />
        </div>

        {/* Prophecy text */}
        <div className="relative">
          <p 
            className="text-lg md:text-xl text-foreground/90 italic leading-relaxed"
            style={{
              fontFamily: 'Georgia, serif',
              textShadow: '0 0 20px hsla(0, 84%, 60%, 0.3)',
            }}
          >
            "{displayedText}
            <span 
              className="inline-block w-[2px] h-5 bg-primary ml-1 align-middle"
              style={{ opacity: showCursor && displayedText.length < prophecy.length ? 1 : 0 }}
            />
            {displayedText.length >= prophecy.length && '"'}
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-primary/50" />
          <span className="text-xs text-muted-foreground tracking-[0.3em] uppercase">The Oracle Speaks</span>
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-primary/50" />
        </div>
      </div>

      <style>{`
        @keyframes prophecy-appear {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
});

ProphecyDisplay.displayName = 'ProphecyDisplay';
