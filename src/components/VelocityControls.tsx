import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VelocityControlsProps {
  velocityCurve: "linear" | "exponential" | "logarithmic";
  velocityToVolume: number;
  velocityToFilter: number;
  onVelocityCurveChange: (curve: "linear" | "exponential" | "logarithmic") => void;
  onVelocityToVolumeChange: (value: number) => void;
  onVelocityToFilterChange: (value: number) => void;
}

export const VelocityControls = ({
  velocityCurve,
  velocityToVolume,
  velocityToFilter,
  onVelocityCurveChange,
  onVelocityToVolumeChange,
  onVelocityToFilterChange,
}: VelocityControlsProps) => {
  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Velocity Sensitivity
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Response Curve</Label>
            <Select value={velocityCurve} onValueChange={onVelocityCurveChange}>
              <SelectTrigger className="h-8 text-xs bg-synth-deep">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="exponential">Exponential</SelectItem>
                <SelectItem value="logarithmic">Logarithmic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs text-muted-foreground">Volume Response</Label>
              <span className="text-xs text-accent">{velocityToVolume}%</span>
            </div>
            <Slider
              value={[velocityToVolume]}
              onValueChange={([value]) => onVelocityToVolumeChange(value)}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs text-muted-foreground">Filter Response</Label>
              <span className="text-xs text-accent">{velocityToFilter}%</span>
            </div>
            <Slider
              value={[velocityToFilter]}
              onValueChange={([value]) => onVelocityToFilterChange(value)}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-synth-border text-xs text-muted-foreground">
            <p>Adjust how key velocity affects volume and filter cutoff</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
