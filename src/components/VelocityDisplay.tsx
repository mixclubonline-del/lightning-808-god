import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Gauge } from "lucide-react";

interface VelocityDisplayProps {
  activeVelocities: Map<number, number>;
}

export const VelocityDisplay = ({ activeVelocities }: VelocityDisplayProps) => {
  const [displayVelocities, setDisplayVelocities] = useState<Array<{ note: number; velocity: number; id: string }>>([]);
  
  useEffect(() => {
    if (activeVelocities.size > 0) {
      const velocities = Array.from(activeVelocities.entries()).map(([note, velocity]) => ({
        note,
        velocity,
        id: `${note}-${Date.now()}`,
      }));
      setDisplayVelocities(velocities);
      
      // Clear after animation
      const timeout = setTimeout(() => {
        setDisplayVelocities([]);
      }, 2000);
      
      return () => clearTimeout(timeout);
    } else {
      setDisplayVelocities([]);
    }
  }, [activeVelocities.size]);
  
  const getNoteName = (midiNote: number) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
  };
  
  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Velocity Monitor
          </h3>
        </div>

        {/* Velocity bars */}
        <div className="space-y-2 min-h-[120px]">
          {displayVelocities.length > 0 ? (
            displayVelocities.map(({ note, velocity, id }) => (
              <div
                key={id}
                className="flex items-center gap-3 p-2 bg-synth-deep rounded-lg border border-synth-border animate-in fade-in slide-in-from-right-4 duration-200"
              >
                {/* Note name */}
                <div className="w-12 text-xs font-bold text-primary text-center">
                  {getNoteName(note)}
                </div>
                
                {/* Velocity bar */}
                <div className="flex-1 h-6 bg-synth-deep rounded-full overflow-hidden border border-synth-border relative">
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-100 rounded-full"
                    style={{
                      width: `${(velocity * 100)}%`,
                      background: velocity > 0.8
                        ? "linear-gradient(90deg, hsl(var(--primary)), hsl(45, 100%, 50%))"
                        : velocity > 0.5
                        ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))"
                        : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)))",
                      boxShadow: velocity > 0.7 ? "0 0 10px hsl(var(--primary))" : "none",
                    }}
                  />
                  
                  {/* Velocity value */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground mix-blend-difference tabular-nums">
                      {Math.round(velocity * 127)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-[120px] text-xs text-muted-foreground">
              Press keys to see velocity
            </div>
          )}
        </div>
        
        <div className="pt-2 border-t border-synth-border text-xs text-muted-foreground">
          <p>Real-time velocity feedback (0-127)</p>
        </div>
      </div>
    </Card>
  );
};
