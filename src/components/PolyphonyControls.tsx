import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Layers } from "lucide-react";

interface PolyphonyControlsProps {
  maxPolyphony: number;
  currentVoices: number;
  onMaxPolyphonyChange: (value: number) => void;
}

export const PolyphonyControls = ({
  maxPolyphony,
  currentVoices,
  onMaxPolyphonyChange,
}: PolyphonyControlsProps) => {
  const voicePercentage = maxPolyphony > 0 ? (currentVoices / maxPolyphony) * 100 : 0;
  
  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Polyphony
          </h3>
        </div>

        <div className="space-y-3">
          {/* Voice Count Display */}
          <div className="p-3 bg-synth-deep rounded-lg border border-synth-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Active Voices
              </span>
              <span className="text-lg font-bold text-primary tabular-nums">
                {currentVoices} / {maxPolyphony}
              </span>
            </div>
            
            {/* Voice meter */}
            <div className="relative h-2 bg-synth-deep rounded-full overflow-hidden border border-synth-border">
              <div
                className="absolute inset-y-0 left-0 transition-all duration-150 rounded-full"
                style={{
                  width: `${voicePercentage}%`,
                  background: voicePercentage > 90
                    ? "linear-gradient(90deg, hsl(var(--destructive)), hsl(45, 100%, 50%))"
                    : voicePercentage > 70
                    ? "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--primary)))"
                    : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)))",
                }}
              />
            </div>
          </div>

          {/* Max Polyphony Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs text-muted-foreground">Max Voices</Label>
              <span className="text-xs text-accent">{maxPolyphony}</span>
            </div>
            <Slider
              value={[maxPolyphony]}
              onValueChange={([value]) => onMaxPolyphonyChange(value)}
              min={1}
              max={32}
              step={1}
              className="cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-synth-border text-xs text-muted-foreground">
            <p>Limit simultaneous voices to reduce CPU usage</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
