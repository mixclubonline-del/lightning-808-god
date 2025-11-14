import { useState, useCallback } from "react";
import { Upload, FileAudio, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DropZoneProps {
  onFileUpload: (file: File) => void;
  className?: string;
}

export const DropZone = ({ onFileUpload, className }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => 
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|wav|ogg|m4a|flac|aiff|aif|opus|wma|aac|alac|ape|wv|mp2|ac3|dts|sfz|exs|nki|nkm|rex|rx2|asd|akp|w64|wav64)$/i)
    );

    if (audioFile) {
      setUploadedFile(audioFile);
      onFileUpload(audioFile);
      toast.success(`Loaded: ${audioFile.name}`);
    } else {
      toast.error("Please upload a supported audio or sample library file");
    }
  }, [onFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onFileUpload(file);
      toast.success(`Loaded: ${file.name}`);
    }
  }, [onFileUpload]);

  const handleClear = useCallback(() => {
    setUploadedFile(null);
    toast.info("File cleared");
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Decorative header */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-synth-deep border-2 border-accent rounded-lg z-10">
        <div className="text-accent text-sm font-bold uppercase tracking-[0.4em] text-center flex items-center gap-2"
          style={{
            textShadow: "0 0 10px rgba(249, 115, 22, 0.6)",
          }}>
          <FileAudio size={16} />
          One-Shot Dropper
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-4 border-dashed rounded-xl p-12 transition-all duration-300",
          "bg-gradient-to-b from-synth-panel to-synth-deep",
          isDragging 
            ? "border-accent bg-accent/10 shadow-[0_0_40px_rgba(249,115,22,0.4)] scale-[1.02]" 
            : uploadedFile
            ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            : "border-synth-border hover:border-accent/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
        )}
      >
        {/* Ambient glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300",
          isDragging ? "bg-gradient-radial from-accent/20 to-transparent opacity-100" : "opacity-0"
        )} />

        {uploadedFile ? (
          // File loaded state
          <div className="relative z-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
                style={{
                  boxShadow: "0 0 20px rgba(239,68,68,0.4)",
                }}>
                <FileAudio className="text-primary" size={32} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xl font-bold text-primary uppercase tracking-wider">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to slice
              </p>
            </div>

            <button
              onClick={handleClear}
              className="mt-4 px-6 py-2 bg-synth-panel border-2 border-synth-border text-muted-foreground rounded-lg hover:border-primary hover:text-primary transition-all flex items-center gap-2 mx-auto"
            >
              <X size={16} />
              Clear & Upload New
            </button>
          </div>
        ) : (
          // Empty state
          <div className="relative z-10 text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-b from-accent/20 to-accent/5 border-2",
                isDragging 
                  ? "border-accent scale-110 shadow-[0_0_30px_rgba(249,115,22,0.6)]" 
                  : "border-synth-border"
              )}>
                <Upload 
                  className={cn(
                    "transition-all duration-300",
                    isDragging ? "text-accent scale-110" : "text-muted-foreground"
                  )} 
                  size={48} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className={cn(
                "text-2xl font-bold uppercase tracking-wider transition-colors",
                isDragging ? "text-accent" : "text-foreground"
              )}>
                {isDragging ? "Drop it here!" : "Drop your one-shot"}
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Drag & drop an audio file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground/70">
                All audio formats • Sound packs • Sample libraries
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">
                MP3 • WAV • FLAC • AIFF • OGG • M4A • OPUS • WMA • AAC • ALAC • SFZ • REX • NKI
              </p>
            </div>

            <label className="inline-block">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aiff,.aif,.opus,.wma,.aac,.alac,.ape,.wv,.mp2,.ac3,.dts,.sfz,.exs,.nki,.nkm,.rex,.rx2,.asd,.akp,.w64,.wav64"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="px-8 py-3 bg-accent/20 border-2 border-accent text-accent rounded-lg hover:bg-accent/30 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] uppercase tracking-wider font-medium cursor-pointer inline-block">
                Browse Files
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
