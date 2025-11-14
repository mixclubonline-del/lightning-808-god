import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download, Check } from "lucide-react";
import { mixAudioBuffers } from "@/utils/audioMixer";
import { audioBufferToBlob } from "@/utils/audioSlicer";
import { toast } from "sonner";

interface LayeringWorkspaceProps {
  sliceBuffer: AudioBuffer;
  matchBuffer: AudioBuffer | null;
  sliceIndex: number;
  matchName: string;
  onCommit: (mixedBuffer: AudioBuffer) => void;
  onClose: () => void;
}

export const LayeringWorkspace = ({
  sliceBuffer,
  matchBuffer,
  sliceIndex,
  matchName,
  onCommit,
  onClose,
}: LayeringWorkspaceProps) => {
  const [sliceGain, setSliceGain] = useState(1.0);
  const [matchGain, setMatchGain] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mixedBuffer, setMixedBuffer] = useState<AudioBuffer | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    audioContextRef.current = new AudioContext();
    return () => {
      stopPlayback();
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (matchBuffer) {
      createMix();
    }
  }, [sliceGain, matchGain]);

  const createMix = async () => {
    if (!matchBuffer) return;
    
    try {
      const mixed = await mixAudioBuffers(sliceBuffer, matchBuffer, sliceGain, matchGain);
      setMixedBuffer(mixed);
    } catch (error) {
      console.error("Mix error:", error);
      toast.error("Failed to create mix");
    }
  };

  const stopPlayback = () => {
    sourceNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        // Node may already be stopped
      }
    });
    sourceNodesRef.current = [];
    setIsPlaying(false);
  };

  const playPreview = () => {
    if (!audioContextRef.current) return;

    if (isPlaying) {
      stopPlayback();
      return;
    }

    const ctx = audioContextRef.current;
    const sources: AudioBufferSourceNode[] = [];

    // Play slice
    const sliceSource = ctx.createBufferSource();
    sliceSource.buffer = sliceBuffer;
    const sliceGainNode = ctx.createGain();
    sliceGainNode.gain.value = sliceGain;
    sliceSource.connect(sliceGainNode);
    sliceGainNode.connect(ctx.destination);
    sliceSource.start();
    sources.push(sliceSource);

    // Play match if available
    if (matchBuffer) {
      const matchSource = ctx.createBufferSource();
      matchSource.buffer = matchBuffer;
      const matchGainNode = ctx.createGain();
      matchGainNode.gain.value = matchGain;
      matchSource.connect(matchGainNode);
      matchGainNode.connect(ctx.destination);
      matchSource.start();
      sources.push(matchSource);
    }

    sourceNodesRef.current = sources;
    setIsPlaying(true);

    // Auto-stop when done
    const duration = Math.max(sliceBuffer.duration, matchBuffer?.duration || 0);
    setTimeout(() => {
      stopPlayback();
    }, duration * 1000);
  };

  const handleCommit = () => {
    if (mixedBuffer) {
      onCommit(mixedBuffer);
      toast.success("Layer committed!");
      onClose();
    }
  };

  const handleExport = async () => {
    if (!mixedBuffer) return;

    try {
      const blob = await audioBufferToBlob(mixedBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slice_${sliceIndex + 1}_layered.wav`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported layered slice!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Layering Workspace - Slice {sliceIndex + 1}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Track 1: Original Slice */}
        <div className="flex flex-col gap-3 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium">Track 1: Original Slice</h4>
          <div className="flex flex-col gap-2">
            <Label>Volume: {Math.round(sliceGain * 100)}%</Label>
            <Slider
              value={[sliceGain]}
              onValueChange={([v]) => setSliceGain(v)}
              min={0}
              max={2}
              step={0.01}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Duration: {sliceBuffer.duration.toFixed(2)}s
          </div>
        </div>

        {/* Track 2: Match Layer */}
        <div className="flex flex-col gap-3 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium">Track 2: {matchName}</h4>
          {matchBuffer ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>Volume: {Math.round(matchGain * 100)}%</Label>
                <Slider
                  value={[matchGain]}
                  onValueChange={([v]) => setMatchGain(v)}
                  min={0}
                  max={2}
                  step={0.01}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Duration: {matchBuffer.duration.toFixed(2)}s
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No match selected</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={playPreview}
          variant="outline"
          className="gap-2"
          disabled={!matchBuffer}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Stop Preview
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Preview Mix
            </>
          )}
        </Button>

        <Button
          onClick={handleCommit}
          disabled={!mixedBuffer}
          className="gap-2"
        >
          <Check className="w-4 h-4" />
          Commit Layer
        </Button>

        <Button
          onClick={handleExport}
          variant="outline"
          disabled={!mixedBuffer}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export Slice
        </Button>
      </div>
    </div>
  );
};
