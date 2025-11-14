import { useState, useEffect } from "react";
import { RecordingManager } from "./RecordingManager";
import { AudioWaveformEditor } from "./AudioWaveformEditor";
import { AutoSlicerControls } from "./AutoSlicerControls";
import { SliceAnalysisManager } from "./SliceAnalysisManager";
import { SliceMatchPanel } from "./SliceMatchPanel";
import { LayeringWorkspace } from "./LayeringWorkspace";
import { DropZone } from "./DropZone";
import { Button } from "@/components/ui/button";
import { extractAllSlices } from "@/utils/audioSlicer";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

interface StudioViewProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  getRecordedAudioBuffer: () => Promise<AudioBuffer | null>;
}

export const StudioView = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  getRecordedAudioBuffer,
}: StudioViewProps) => {
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [sliceMarkers, setSliceMarkers] = useState<number[]>([]);
  const [slices, setSlices] = useState<any[]>([]);
  const [sliceIds, setSliceIds] = useState<string[]>([]);
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);
  const [layeringMatch, setLayeringMatch] = useState<any>(null);
  const [matchBuffer, setMatchBuffer] = useState<AudioBuffer | null>(null);

  const handleRecordingReady = (id: string, buffer: AudioBuffer) => {
    setRecordingId(id);
    setAudioBuffer(buffer);
    setSliceMarkers([]);
    setSlices([]);
    setSliceIds([]);
  };

  const handleFileUpload = async (file: File) => {
    try {
      toast.info("Loading audio file...");
      
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const uploadId = `upload_${Date.now()}`;
      setRecordingId(uploadId);
      setAudioBuffer(buffer);
      setSliceMarkers([]);
      setSlices([]);
      setSliceIds([]);
      
      toast.success("Audio loaded! Ready to slice.");
      await audioContext.close();
    } catch (error) {
      console.error("Error loading audio file:", error);
      toast.error("Failed to load audio file");
    }
  };

  const handleCreateSlices = async () => {
    if (!audioBuffer) return;

    const extractedSlices = await extractAllSlices(audioBuffer, sliceMarkers);
    setSlices(extractedSlices);
  };

  const handleAnalysisComplete = (ids: string[]) => {
    setSliceIds(ids);
  };

  const handleMatchSelect = async (sliceIndex: number, match: any) => {
    setSelectedSlice(sliceIndex);
    setLayeringMatch(match);

    // Load match audio
    try {
      const response = await fetch(match.sample.file_url);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      setMatchBuffer(buffer);
      await audioContext.close();
    } catch (error) {
      console.error("Failed to load match audio:", error);
    }
  };

  const handleLayerCommit = (mixedBuffer: AudioBuffer) => {
    // Update the slice with the mixed buffer
    setSlices(prev =>
      prev.map((slice, i) =>
        i === selectedSlice ? { ...slice, buffer: mixedBuffer } : slice
      )
    );
    setSelectedSlice(null);
    setLayeringMatch(null);
    setMatchBuffer(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Step 1: Upload or Record */}
      {!audioBuffer && (
        <div className="space-y-6">
          <DropZone onFileUpload={handleFileUpload} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-synth-border"></div>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-synth-deep px-6 py-1 text-muted-foreground tracking-[0.3em] font-medium border-2 border-synth-border rounded-full">
                Or Record Live
              </span>
            </div>
          </div>

          <RecordingManager
            isRecording={isRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onRecordingReady={handleRecordingReady}
            getRecordedAudioBuffer={getRecordedAudioBuffer}
          />
        </div>
      )}

      {/* Step 2: Waveform & Slicing */}
      {audioBuffer && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Waveform Editor</h3>
            {sliceMarkers.length > 0 && slices.length === 0 && (
              <Button onClick={handleCreateSlices} className="gap-2">
                <Wand2 className="w-4 h-4" />
                Create {sliceMarkers.length + 1} Slices
              </Button>
            )}
          </div>

          <AudioWaveformEditor
            audioBuffer={audioBuffer}
            sliceMarkers={sliceMarkers}
            onMarkersChange={setSliceMarkers}
            selectedSlice={selectedSlice}
            onSliceSelect={setSelectedSlice}
          />

          <AutoSlicerControls
            audioBuffer={audioBuffer}
            onMarkersGenerated={setSliceMarkers}
            onClearMarkers={() => setSliceMarkers([])}
          />
        </div>
      )}

      {/* Step 3: Analysis */}
      {slices.length > 0 && sliceIds.length === 0 && recordingId && (
        <SliceAnalysisManager
          recordingId={recordingId}
          slices={slices}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {/* Step 4: Matching */}
      {sliceIds.length > 0 && (
        <SliceMatchPanel
          slices={slices}
          sliceIds={sliceIds}
          onMatchSelect={handleMatchSelect}
        />
      )}

      {/* Step 5: Layering */}
      {selectedSlice !== null && layeringMatch && (
        <LayeringWorkspace
          sliceBuffer={slices[selectedSlice].buffer}
          matchBuffer={matchBuffer}
          sliceIndex={selectedSlice}
          matchName={layeringMatch.sample.name}
          onCommit={handleLayerCommit}
          onClose={() => {
            setSelectedSlice(null);
            setLayeringMatch(null);
            setMatchBuffer(null);
          }}
        />
      )}
    </div>
  );
};
