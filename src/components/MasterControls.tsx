import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume2, AlertTriangle } from "lucide-react";

interface MasterControlsProps {
  masterVolume: number;
  limiterEnabled: boolean;
  limiterThreshold: number;
  onMasterVolumeChange: (value: number) => void;
  onLimiterEnabledChange: (enabled: boolean) => void;
  onLimiterThresholdChange: (value: number) => void;
  analyser?: AnalyserNode | null;
}

export const MasterControls = ({
  masterVolume,
  limiterEnabled,
  limiterThreshold,
  onMasterVolumeChange,
  onLimiterEnabledChange,
  onLimiterThresholdChange,
  analyser,
}: MasterControlsProps) => {
  const [peakLevel, setPeakLevel] = useState(0);
  const [clipping, setClipping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Calculate peak level
      let peak = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = Math.abs((dataArray[i] - 128) / 128);
        if (normalized > peak) peak = normalized;
      }

      const peakDb = peak * 100;
      setPeakLevel(peakDb);
      
      // Check for clipping
      if (peakDb > 95) {
        setClipping(true);
        setTimeout(() => setClipping(false), 500);
      }

      // Draw meter
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Get computed colors from CSS variables
      const getComputedColor = (varName: string) => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        // If it's HSL values without hsl(), wrap them
        if (value && !value.startsWith('hsl') && !value.startsWith('#')) {
          return `hsl(${value})`;
        }
        return value || '#000';
      };

      // Background
      ctx.fillStyle = getComputedColor('--synth-deep');
      ctx.fillRect(0, 0, width, height);

      // Level bar
      const levelWidth = (peakDb / 100) * width;
      
      // Gradient based on level
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, getComputedColor('--primary'));
      gradient.addColorStop(0.7, getComputedColor('--accent'));
      gradient.addColorStop(0.9, "hsl(45, 100%, 50%)"); // Yellow
      gradient.addColorStop(1, "hsl(0, 100%, 50%)"); // Red

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, levelWidth, height);

      // Threshold line
      if (limiterEnabled) {
        const thresholdX = (limiterThreshold / 100) * width;
        ctx.strokeStyle = getComputedColor('--destructive');
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(thresholdX, 0);
        ctx.lineTo(thresholdX, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, limiterEnabled, limiterThreshold]);

  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Master Output
          </h3>
          {clipping && (
            <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
          )}
        </div>

        <div className="space-y-3">
          {/* Output Meter */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Output Level: {Math.round(peakLevel)}%
            </Label>
            <canvas
              ref={canvasRef}
              width={280}
              height={24}
              className="w-full h-6 rounded border border-synth-border"
            />
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs text-muted-foreground">Master Volume</Label>
              <span className="text-xs text-accent">{masterVolume}%</span>
            </div>
            <Slider
              value={[masterVolume]}
              onValueChange={([value]) => onMasterVolumeChange(value)}
              min={0}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Limiter */}
          <div className="pt-2 border-t border-synth-border">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Soft Limiter</Label>
              <Switch
                checked={limiterEnabled}
                onCheckedChange={onLimiterEnabledChange}
              />
            </div>

            {limiterEnabled && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs text-muted-foreground">Threshold</Label>
                  <span className="text-xs text-accent">{limiterThreshold}%</span>
                </div>
                <Slider
                  value={[limiterThreshold]}
                  onValueChange={([value]) => onLimiterThresholdChange(value)}
                  min={50}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
