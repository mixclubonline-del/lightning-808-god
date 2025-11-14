import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  convertAudioFormat, 
  downloadAudioFile, 
  type AudioFormat 
} from "@/utils/audioConverter";

interface AudioConverterProps {
  audioBuffer: AudioBuffer | null;
  originalFileName: string;
}

export const AudioConverter = ({ audioBuffer, originalFileName }: AudioConverterProps) => {
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('wav');
  const [quality, setQuality] = useState([0.9]);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!audioBuffer) {
      toast.error("No audio loaded");
      return;
    }

    setIsConverting(true);
    
    try {
      toast.info(`Converting to ${targetFormat.toUpperCase()}...`);
      
      const blob = await convertAudioFormat(audioBuffer, {
        format: targetFormat,
        quality: quality[0],
        sampleRate: audioBuffer.sampleRate,
      });

      const baseName = originalFileName.replace(/\.[^/.]+$/, "");
      const fileName = `${baseName}_converted.${targetFormat}`;
      
      downloadAudioFile(blob, fileName);
      
      toast.success(`Converted to ${targetFormat.toUpperCase()} and downloaded!`);
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  if (!audioBuffer) {
    return null;
  }

  return (
    <div className="bg-synth-panel rounded-2xl border-2 border-synth-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent flex items-center justify-center">
          <RefreshCw className="text-accent" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">
            Format Converter
          </h3>
          <p className="text-xs text-muted-foreground">
            Convert to different audio formats
          </p>
        </div>
      </div>

      {/* Audio Info */}
      <div className="bg-synth-deep rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sample Rate:</span>
          <span className="text-primary font-mono">{audioBuffer.sampleRate} Hz</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Channels:</span>
          <span className="text-primary font-mono">{audioBuffer.numberOfChannels}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Duration:</span>
          <span className="text-primary font-mono">{audioBuffer.duration.toFixed(2)}s</span>
        </div>
      </div>

      {/* Format Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground uppercase tracking-wider">
          Target Format
        </label>
        <Select value={targetFormat} onValueChange={(value) => setTargetFormat(value as AudioFormat)}>
          <SelectTrigger className="bg-synth-deep border-synth-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wav">WAV (Lossless)</SelectItem>
            <SelectItem value="ogg">OGG Vorbis</SelectItem>
            <SelectItem value="webm">WebM</SelectItem>
            <SelectItem value="mp3">MP3 (WAV fallback)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Slider (for lossy formats) */}
      {(targetFormat === 'ogg' || targetFormat === 'webm') && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground uppercase tracking-wider">
              Quality
            </label>
            <span className="text-xs text-primary font-mono">
              {(quality[0] * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={quality}
            onValueChange={setQuality}
            min={0.1}
            max={1}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher quality = larger file size
          </p>
        </div>
      )}

      {/* Convert Button */}
      <Button
        onClick={handleConvert}
        disabled={isConverting}
        className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
      >
        {isConverting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Convert & Download
          </>
        )}
      </Button>

      {/* Info Note */}
      <div className="bg-synth-deep/50 rounded-lg p-3 border border-synth-border/50">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> MP3 encoding requires additional libraries. 
          Currently converts to WAV format as fallback. Use OGG or WebM for compression.
        </p>
      </div>
    </div>
  );
};
