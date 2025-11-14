import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { extractAudioFeatures } from "@/utils/audioFeatureExtraction";
import { audioBufferToBlob } from "@/utils/audioSlicer";
import { toast } from "sonner";

interface AudioSlice {
  buffer: AudioBuffer;
  startTime: number;
  endTime: number;
  index: number;
}

interface SliceAnalysisManagerProps {
  recordingId: string;
  slices: AudioSlice[];
  onAnalysisComplete: (sliceIds: string[]) => void;
}

export const SliceAnalysisManager = ({
  recordingId,
  slices,
  onAnalysisComplete,
}: SliceAnalysisManagerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const analyzeAllSlices = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setIsComplete(false);

    const sliceIds: string[] = [];

    try {
      for (let i = 0; i < slices.length; i++) {
        setCurrentSlice(i + 1);
        const slice = slices[i];

        // Extract features
        const features = await extractAudioFeatures(slice.buffer);

        // Convert to WAV
        const wavBlob = await audioBufferToBlob(slice.buffer);

        // Upload to storage
        const filepath = `recordings/${recordingId}/slice_${i}.wav`;
        const { error: uploadError } = await supabase.storage
          .from('sound-samples')
          .upload(filepath, wavBlob, {
            contentType: 'audio/wav',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('sound-samples')
          .getPublicUrl(filepath);

        // Insert into database
        const { data: sliceData, error: dbError } = await supabase
          .from('sound_samples')
          .insert({
            name: `Slice ${i + 1}`,
            file_path: filepath,
            file_url: publicUrl,
            duration: slice.buffer.duration,
            category: 'slice',
            parent_recording_id: recordingId,
            slice_index: i,
            is_slice: true,
            slice_start_time: slice.startTime,
            slice_end_time: slice.endTime,
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

        sliceIds.push(sliceData.id);
        setProgress(((i + 1) / slices.length) * 100);
      }

      setIsComplete(true);
      toast.success(`Successfully analyzed ${slices.length} slices!`);
      onAnalysisComplete(sliceIds);
    } catch (error) {
      console.error("Slice analysis error:", error);
      toast.error("Failed to analyze slices");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Slice Analysis</h4>
        {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
      </div>

      {!isAnalyzing && !isComplete && (
        <Button onClick={analyzeAllSlices} disabled={slices.length === 0}>
          Analyze {slices.length} Slices
        </Button>
      )}

      {isAnalyzing && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing slice {currentSlice} of {slices.length}...
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {isComplete && (
        <p className="text-sm text-muted-foreground">
          All slices analyzed and uploaded successfully!
        </p>
      )}
    </div>
  );
};
