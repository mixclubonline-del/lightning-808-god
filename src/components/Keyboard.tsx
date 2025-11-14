import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface KeyboardProps {
  onNoteOn?: (midiNote: number) => void;
  onNoteOff?: (midiNote: number) => void;
}

export const Keyboard = ({ onNoteOn, onNoteOff }: KeyboardProps) => {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  const whiteKeys = Array.from({ length: 14 });
  const blackKeys = [1, 2, 4, 5, 6, 8, 9, 11, 12, 13];
  const baseNote = 36; // C2 - good for 808 bass

  const handleKeyPress = (index: number, isBlack: boolean = false) => {
    const midiNote = baseNote + index + (isBlack ? 1 : 0);
    setActiveKeys((prev) => new Set(prev).add(index));
    onNoteOn?.(midiNote);
    
    setTimeout(() => {
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      onNoteOff?.(midiNote);
    }, 200);
  };

  // Keyboard support
  useEffect(() => {
    const keyMap: Record<string, number> = {
      'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5, 't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11, 'k': 12, 'o': 13, 'l': 14
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const index = keyMap[e.key.toLowerCase()];
      if (index !== undefined && !activeKeys.has(index)) {
        handleKeyPress(index);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeKeys]);

  return (
    <div className="w-full">
      <div className="relative bg-gradient-to-b from-synth-panel to-synth-deep rounded-xl border-2 border-synth-border p-8 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
        {/* Decorative header */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-synth-deep border-2 border-synth-border rounded-lg">
          <div className="text-primary text-lg font-bold uppercase tracking-[0.4em] text-center"
            style={{
              textShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
            }}>
            Keyboard
          </div>
        </div>
        
        {/* Keyboard container with glow effect */}
        <div className="relative h-48 bg-gradient-to-b from-synth-deep/50 to-synth-deep rounded-xl border border-synth-border/50 p-6 shadow-inner">
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-xl pointer-events-none" />
          
          <div className="relative h-full flex gap-[3px]">
            {whiteKeys.map((_, index) => (
              <button
                key={`white-${index}`}
                onClick={() => handleKeyPress(index, false)}
                className={cn(
                  "flex-1 bg-gradient-to-b rounded-b-xl transition-all duration-100 border-2 relative group",
                  activeKeys.has(index)
                    ? "from-primary via-primary/90 to-secondary shadow-[0_0_30px_rgba(239,68,68,0.9),0_0_60px_rgba(239,68,68,0.5)] border-primary scale-[1.02] z-10"
                    : "from-secondary/70 to-secondary/50 hover:from-secondary hover:to-secondary/80 border-synth-border/30 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                )}
                style={{
                  filter: activeKeys.has(index) ? "brightness(1.3)" : "brightness(1)",
                  boxShadow: activeKeys.has(index) ? "0 4px 20px rgba(239,68,68,0.8), inset 0 -2px 10px rgba(0,0,0,0.3)" : "inset 0 -2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {/* Key reflection effect */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            {blackKeys.map((keyIndex) => (
              <button
                key={`black-${keyIndex}`}
                onClick={() => handleKeyPress(keyIndex, true)}
                className={cn(
                  "absolute w-[5.5%] h-[65%] bg-gradient-to-b rounded-b-lg border-2 transition-all duration-100 group",
                  activeKeys.has(keyIndex + 100) 
                    ? "from-primary/80 to-primary border-primary shadow-[0_0_25px_rgba(239,68,68,0.8)] scale-105 z-20" 
                    : "from-synth-deep to-black border-synth-border/50 hover:from-synth-deep/80 hover:border-primary/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                )}
                style={{
                  left: `${keyIndex * 7.14 - 2.75}%`,
                  boxShadow: activeKeys.has(keyIndex + 100) 
                    ? "0 4px 15px rgba(239,68,68,0.7), inset 0 2px 4px rgba(255,255,255,0.1)"
                    : "0 2px 8px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.05)",
                }}
              >
                {/* Black key highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/5 to-transparent rounded-t-lg" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Keyboard hint text */}
        <div className="mt-4 text-center text-xs text-muted-foreground/60 uppercase tracking-widest">
          Use keyboard keys: A-L or click to play
        </div>
      </div>
    </div>
  );
};
