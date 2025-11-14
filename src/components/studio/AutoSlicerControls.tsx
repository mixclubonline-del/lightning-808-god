import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { detectTransients, detectBPM, generateEqualMarkers, generateBeatMarkers } from "@/utils/audioSlicer";
import { Scissors, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AutoSlicerControlsProps {
  audioBuffer: AudioBuffer | null;
  onMarkersGenerated: (markers: number[]) => void;
  onClearMarkers: () => void;
}

export const AutoSlicerControls = ({
  audioBuffer,
  onMarkersGenerated,
  onClearMarkers,
}: AutoSlicerControlsProps) => {
  const [method, setMethod] = useState<string>("equal");
  const [interval, setInterval] = useState<number>(1);
  const [sensitivity, setSensitivity] = useState<number>(0.3);

  const handleAutoSlice = () => {
    if (!audioBuffer) {
      toast.error("No audio to slice");
      return;
    }

    let markers: number[] = [];

    try {
      switch (method) {
        case "equal":
          markers = generateEqualMarkers(audioBuffer.duration, interval);
          toast.success(`Generated ${markers.length} equal-duration slices`);
          break;

        case "transient":
          markers = detectTransients(audioBuffer, sensitivity);
          toast.success(`Detected ${markers.length} transients`);
          break;

        case "beat":
          const bpm = detectBPM(audioBuffer);
          markers = generateBeatMarkers(audioBuffer.duration, bpm);
          toast.success(`Detected ${bpm} BPM, generated ${markers.length} beat markers`);
          break;

        default:
          toast.error("Unknown slicing method");
          return;
      }

      onMarkersGenerated(markers);
    } catch (error) {
      console.error("Auto-slice error:", error);
      toast.error("Failed to auto-slice audio");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg">
      <h4 className="text-sm font-semibold text-foreground">Auto-Slice Controls</h4>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="method">Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">Equal Duration</SelectItem>
              <SelectItem value="transient">Transient Detection</SelectItem>
              <SelectItem value="beat">Beat Grid (Auto BPM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {method === "equal" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="interval">Interval: {interval.toFixed(2)}s</Label>
            <Slider
              id="interval"
              value={[interval]}
              onValueChange={([v]) => setInterval(v)}
              min={0.1}
              max={4}
              step={0.1}
              className="w-full"
            />
          </div>
        )}

        {method === "transient" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="sensitivity">Sensitivity: {sensitivity.toFixed(2)}</Label>
            <Slider
              id="sensitivity"
              value={[sensitivity]}
              onValueChange={([v]) => setSensitivity(v)}
              min={0.1}
              max={0.8}
              step={0.05}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleAutoSlice}
          disabled={!audioBuffer}
          variant="default"
          size="sm"
          className="flex-1 gap-2"
        >
          <Scissors className="w-4 h-4" />
          Auto-Slice
        </Button>

        <Button
          onClick={onClearMarkers}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};
