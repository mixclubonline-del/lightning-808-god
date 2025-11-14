import { Download, Circle, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownload: () => void;
  hasRecording: boolean;
}

export const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onDownload,
  hasRecording,
}: RecordingControlsProps) => {
  return (
    <div className="flex gap-3 items-center justify-center">
      {!isRecording ? (
        <button
          onClick={onStartRecording}
          className="px-4 py-2 bg-primary/20 border-2 border-primary text-primary rounded-lg hover:bg-primary/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center gap-2 uppercase tracking-wider text-sm font-medium"
        >
          <Circle size={16} fill="currentColor" />
          Record
        </button>
      ) : (
        <button
          onClick={onStopRecording}
          className="px-4 py-2 bg-destructive/20 border-2 border-destructive text-destructive rounded-lg hover:bg-destructive/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse flex items-center gap-2 uppercase tracking-wider text-sm font-medium"
        >
          <Square size={16} fill="currentColor" />
          Stop
        </button>
      )}

      {hasRecording && !isRecording && (
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-accent/20 border-2 border-accent text-accent rounded-lg hover:bg-accent/30 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] flex items-center gap-2 uppercase tracking-wider text-sm font-medium"
        >
          <Download size={16} />
          Export WAV
        </button>
      )}
    </div>
  );
};
