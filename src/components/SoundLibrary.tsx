import { useState, useRef } from "react";
import { Upload, Search, Trash2, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { extractAudioFeatures, loadAudioFile } from "@/utils/audioFeatureExtraction";
import { toast } from "sonner";

interface SoundSample {
  id: string;
  name: string;
  file_url: string;
  duration: number;
  category: string;
  created_at: string;
}

interface SoundLibraryProps {
  onSampleSelect?: (sample: SoundSample) => void;
  onFindSimilar?: (sample: SoundSample) => void;
}

export const SoundLibrary = ({ onSampleSelect, onFindSimilar }: SoundLibraryProps) => {
  const [samples, setSamples] = useState<SoundSample[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSamples = async () => {
    const { data, error } = await supabase
      .from("sound_samples")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load samples");
      return;
    }

    setSamples(data || []);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Load and analyze audio
        const audioBuffer = await loadAudioFile(file);
        const features = await extractAudioFeatures(audioBuffer);

        // Upload to storage
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("sound-samples")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("sound-samples")
          .getPublicUrl(fileName);

        // Save to database with features
        const { error: dbError } = await supabase.from("sound_samples").insert({
          name: file.name.replace(/\.[^/.]+$/, ""),
          file_path: fileName,
          file_url: publicUrl,
          duration: features.duration,
          spectral_centroid: features.spectralCentroid,
          spectral_rolloff: features.spectralRolloff,
          spectral_flatness: features.spectralFlatness,
          rms_energy: features.rmsEnergy,
          zero_crossing_rate: features.zeroCrossingRate,
          low_freq_energy: features.lowFreqEnergy,
          mid_freq_energy: features.midFreqEnergy,
          high_freq_energy: features.highFreqEnergy,
          category: "808",
        });

        if (dbError) throw dbError;
      }

      toast.success(`Uploaded ${files.length} sample(s)`);
      loadSamples();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload samples");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    try {
      await supabase.storage.from("sound-samples").remove([filePath]);
      await supabase.from("sound_samples").delete().eq("id", id);
      toast.success("Sample deleted");
      loadSamples();
    } catch (error) {
      toast.error("Failed to delete sample");
    }
  };

  const filteredSamples = samples.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music2 size={16} className="text-primary" />
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Sound Library
          </span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-1",
            isUploading
              ? "bg-synth-deep border-2 border-synth-border text-muted-foreground cursor-not-allowed"
              : "bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
          )}
        >
          <Upload size={12} />
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search samples..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-synth-deep border-2 border-synth-border text-foreground rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredSamples.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-8">
            {samples.length === 0 ? "Upload samples to get started" : "No samples found"}
          </div>
        ) : (
          filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="bg-synth-deep border border-synth-border rounded p-2 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-foreground text-xs font-medium truncate">{sample.name}</div>
                  <div className="text-muted-foreground text-[10px]">
                    {sample.duration.toFixed(1)}s • {sample.category}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onFindSimilar?.(sample)}
                    className="p-1 hover:bg-accent/20 rounded text-accent"
                    title="Find similar"
                  >
                    <Search size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(sample.id, sample.file_url)}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
