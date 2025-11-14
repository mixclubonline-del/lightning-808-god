import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Square, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { extractAudioFeatures } from "@/utils/audioFeatureExtraction";
import { toast } from "sonner";

interface RecordingManagerProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRecordingReady: (recordingId: string, audioBuffer: AudioBuffer) => void;
  getRecordedAudioBuffer: () => Promise<AudioBuffer | null>;
}

export const RecordingManager = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onRecordingReady,
  getRecordedAudioBuffer,
}: RecordingManagerProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStopAndProcess = async () => {
    onStopRecording();
    setIsProcessing(true);

    try {
      // Wait a moment for recording to finalize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const audioBuffer = await getRecordedAudioBuffer();
      if (!audioBuffer) {
        toast.error("Failed to get recorded audio");
        return;
      }

      setIsUploading(true);

      // Convert AudioBuffer to WAV blob
      const wavBlob = await audioBufferToWav(audioBuffer);
      
      // Generate filename
      const timestamp = Date.now();
      const filename = `recording_${timestamp}.wav`;
      const filepath = `recordings/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('sound-samples')
        .upload(filepath, wavBlob, {
          contentType: 'audio/wav',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sound-samples')
        .getPublicUrl(filepath);

      // Extract audio features
      const features = await extractAudioFeatures(audioBuffer);

      // Insert into database
      const { data: recordingData, error: dbError } = await supabase
        .from('sound_samples')
        .insert({
          name: `Recording ${new Date().toLocaleString()}`,
          file_path: filepath,
          file_url: publicUrl,
          duration: audioBuffer.duration,
          category: 'recording',
          is_slice: false,
          spectral_centroid: features.spectralCentroid,
          spectral_rolloff: features.spectralRolloff,
          spectral_flatness: features.spectralFlatness,
          rms_energy: features.rmsEnergy,
          zero_crossing_rate: features.zeroCrossingRate,
          low_freq_energy: features.lowFreqEnergy,
          mid_freq_energy: features.midFreqEnergy,
          high_freq_energy: features.highFreqEnergy,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("Recording saved successfully!");
      onRecordingReady(recordingData.id, audioBuffer);
    } catch (error) {
      console.error("Error processing recording:", error);
      toast.error("Failed to process recording");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setIsUploading(true);

    try {
      // Load audio file
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Upload to storage
      const timestamp = Date.now();
      const filepath = `recordings/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('sound-samples')
        .upload(filepath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sound-samples')
        .getPublicUrl(filepath);

      // Extract features
      const features = await extractAudioFeatures(audioBuffer);

      // Insert into database
      const { data: recordingData, error: dbError } = await supabase
        .from('sound_samples')
        .insert({
          name: file.name.replace(/\.[^/.]+$/, ''),
          file_path: filepath,
          file_url: publicUrl,
          duration: audioBuffer.duration,
          category: 'recording',
          is_slice: false,
          spectral_centroid: features.spectralCentroid,
          spectral_rolloff: features.spectralRolloff,
          spectral_flatness: features.spectralFlatness,
          rms_energy: features.rmsEnergy,
          zero_crossing_rate: features.zeroCrossingRate,
          low_freq_energy: features.lowFreqEnergy,
          mid_freq_energy: features.midFreqEnergy,
          high_freq_energy: features.highFreqEnergy,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("Audio file uploaded successfully!");
      onRecordingReady(recordingData.id, audioBuffer);
      
      await audioContext.close();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload audio file");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold text-foreground">Recording Studio</h3>
      
      <div className="flex gap-4 items-center justify-center">
        {!isRecording && !isProcessing ? (
          <>
            <Button
              onClick={onStartRecording}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Circle className="w-4 h-4 fill-destructive text-destructive" />
              Start Recording
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button variant="outline" size="lg" className="gap-2" disabled={isUploading}>
                <Upload className="w-4 h-4" />
                Upload Audio
              </Button>
            </div>
          </>
        ) : isRecording ? (
          <Button
            onClick={handleStopAndProcess}
            variant="destructive"
            size="lg"
            className="gap-2 animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop & Process
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isUploading ? "Uploading and analyzing..." : "Processing..."}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to convert AudioBuffer to WAV
async function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  const channels = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
