import { useCallback, useState } from "react";
import { Upload, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { readPresetFile } from "@/utils/presetIO";
import { Preset } from "@/types/preset";
import { useToast } from "@/hooks/use-toast";

interface PresetFileDropZoneProps {
  onPresetLoaded: (preset: Preset) => void;
}

export const PresetFileDropZone = ({ onPresetLoaded }: PresetFileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".json")) {
        toast({
          title: "Invalid File",
          description: "Please upload a JSON preset file",
          variant: "destructive",
        });
        return;
      }

      try {
        const preset = await readPresetFile(file);
        onPresetLoaded(preset);
        toast({
          title: "Preset Loaded",
          description: `Successfully loaded ${preset.name}`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    [onPresetLoaded, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-all",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-synth-border bg-synth-deep/50 hover:border-accent"
      )}
    >
      <input
        type="file"
        accept=".json"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        {isDragging ? (
          <Upload className="w-8 h-8 text-primary animate-bounce" />
        ) : (
          <FileJson className="w-8 h-8 text-muted-foreground" />
        )}
        
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {isDragging ? "Drop preset file here" : "Drop preset file or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports .json preset files
          </p>
        </div>
      </div>
    </div>
  );
};
