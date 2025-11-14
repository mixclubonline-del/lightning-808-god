import { Knob } from "./Knob";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface ReverbModuleProps {
  size: number;
  damping: number;
  mix: number;
  enabled: boolean;
  onSizeChange: (value: number) => void;
  onDampingChange: (value: number) => void;
  onMixChange: (value: number) => void;
  onEnabledChange: (enabled: boolean) => void;
}

export const ReverbModule = ({
  size,
  damping,
  mix,
  enabled,
  onSizeChange,
  onDampingChange,
  onMixChange,
  onEnabledChange,
}: ReverbModuleProps) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Pluto Verb</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="reverb-enabled" className="text-sm text-muted-foreground">
            {enabled ? "ON" : "OFF"}
          </Label>
          <Switch
            id="reverb-enabled"
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col items-center gap-2">
          <Knob
            value={size}
            onChange={onSizeChange}
            label="Size"
            className={!enabled ? "opacity-50 pointer-events-none" : ""}
          />
          <span className="text-xs text-muted-foreground">{size}%</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Knob
            value={damping}
            onChange={onDampingChange}
            label="Damping"
            className={!enabled ? "opacity-50 pointer-events-none" : ""}
          />
          <span className="text-xs text-muted-foreground">{damping}%</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Knob
            value={mix}
            onChange={onMixChange}
            label="Mix"
            className={!enabled ? "opacity-50 pointer-events-none" : ""}
          />
          <span className="text-xs text-muted-foreground">{mix}%</span>
        </div>
      </div>

      {/* Visual representation */}
      <div className="mt-6 h-16 bg-background/50 rounded-lg overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {enabled && (
            <div className="w-full h-full relative">
              {/* Decay visualization */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-primary/20 rounded-full animate-pulse"
                  style={{
                    left: `${i * 12}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: `${60 - (i * (100 - size) / 10)}px`,
                    height: `${60 - (i * (100 - size) / 10)}px`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.8 - (i * 0.1),
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
