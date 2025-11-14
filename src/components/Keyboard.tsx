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
    <div className="flex flex-col gap-3">
      <div className="text-primary text-sm font-medium uppercase tracking-[0.3em] text-right pr-4">
        KEYSOUN
      </div>
      <div className="relative h-32 bg-synth-deep rounded-lg border-2 border-synth-border p-4">
        <div className="relative h-full flex gap-[2px]">
          {whiteKeys.map((_, index) => (
            <button
              key={`white-${index}`}
              onClick={() => handleKeyPress(index, false)}
              className={cn(
                "flex-1 bg-gradient-to-b rounded-b-lg transition-all duration-100",
                activeKeys.has(index)
                  ? "from-primary to-secondary shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                  : "from-primary/80 to-secondary/80 hover:from-primary hover:to-secondary"
              )}
              style={{
                filter: activeKeys.has(index) ? "brightness(1.5)" : "brightness(1)",
              }}
            />
          ))}
          {blackKeys.map((keyIndex) => (
            <button
              key={`black-${keyIndex}`}
              onClick={() => handleKeyPress(keyIndex, true)}
              className={cn(
                "absolute w-[6%] h-[60%] bg-synth-deep rounded-b-lg border border-synth-border",
                "transition-all duration-100 hover:bg-primary/30",
                activeKeys.has(keyIndex + 100) && "bg-primary/50 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
              )}
              style={{
                left: `${keyIndex * 7.14 - 2.5}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
