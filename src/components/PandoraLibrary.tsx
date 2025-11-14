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

interface PandoraLibraryProps {
  onSampleSelect?: (sample: SoundSample) => void;
  onFindSimilar?: (sample: SoundSample) => void;
}

export const PandoraLibrary = ({ onSampleSelect, onFindSimilar }: PandoraLibraryProps) => {
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
    <div className="bg-synth-panel rounded-lg border-2 border-purple-500/50 p-4 h-full flex flex-col shadow-[0_0_20px_rgba(168,85,247,0.2)] marble-texture sacred-geometry olympian-backdrop">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music2 size={16} className="text-purple-400" />
          <span className="text-purple-400 text-sm font-medium uppercase tracking-wider divine-glow"
            style={{
              textShadow: "0 0 10px rgba(168, 85, 247, 0.5)",
            }}>
            Pandora's Library
          </span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-1",
            isUploading
              ? "bg-synth-deep border border-synth-border text-muted-foreground cursor-not-allowed"
              : "bg-purple-500/20 border border-purple-500 text-purple-400 hover:bg-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
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

      <div className="relative mb-4">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-400/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sounds..."
          className="w-full bg-synth-deep border border-purple-500/30 text-foreground rounded px-8 py-2 text-xs focus:outline-none focus:border-purple-500 transition-colors placeholder:text-purple-400/30"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredSamples.length === 0 ? (
          <div className="text-center text-purple-400/60 text-xs py-8">
            {samples.length === 0 ? "Box contains all sounds" : "No matching sounds"}
          </div>
        ) : (
          filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="bg-synth-deep border border-purple-500/30 rounded p-3 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-purple-300 text-xs font-medium truncate">
                    {sample.name}
                  </div>
                  <div className="text-purple-400/50 text-[10px] mt-1">
                    {sample.duration.toFixed(2)}s • {sample.category}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onFindSimilar && (
                    <button
                      onClick={() => onFindSimilar(sample)}
                      className="p-1 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-[10px]"
                      title="Find similar"
                    >
                      Find
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(sample.id, sample.file_url.split('/').pop() || '')}
                    className="p-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="text-purple-400/50 text-[10px] uppercase tracking-widest text-center mt-2">
        All sounds within
      </div>
    </div>
  );
};