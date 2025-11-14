import { Download, Circle, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface MnemosyneRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownload: () => void;
  hasRecording: boolean;
}

export const MnemosyneRecorder = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onDownload,
  hasRecording,
}: MnemosyneRecorderProps) => {
  return (
    <div className="flex gap-3 items-center justify-center">
      {!isRecording ? (
        <button
          onClick={onStartRecording}
          className="px-4 py-2 bg-amber-500/20 border-2 border-amber-500 text-amber-400 rounded-2xl hover:bg-amber-500/30 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center gap-2 uppercase tracking-wider text-sm font-medium"
          style={{
            textShadow: "0 0 8px rgba(245, 158, 11, 0.5)",
          }}
        >
          <Circle size={16} fill="currentColor" />
          Record
        </button>
      ) : (
        <button
          onClick={onStopRecording}
          className="px-4 py-2 bg-destructive/20 border-2 border-destructive text-destructive rounded-2xl hover:bg-destructive/30 transition-all shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse flex items-center gap-2 uppercase tracking-wider text-sm font-medium"
        >
          <Square size={16} fill="currentColor" />
          Stop
        </button>
      )}

      {hasRecording && !isRecording && (
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-amber-500/20 border-2 border-amber-500 text-amber-400 rounded-2xl hover:bg-amber-500/30 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center gap-2 uppercase tracking-wider text-sm font-medium"
          style={{
            textShadow: "0 0 8px rgba(245, 158, 11, 0.5)",
          }}
        >
          <Download size={16} />
          Export WAV
        </button>
      )}
    </div>
  );
};