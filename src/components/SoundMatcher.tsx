import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { AudioFeatures } from "@/utils/audioFeatureExtraction";
import { toast } from "sonner";

interface MatchResult {
  id: string;
  similarity: number;
  reason: string;
  sample: {
    id: string;
    name: string;
    file_url: string;
    duration: number;
    category: string;
  };
}

interface SoundMatcherProps {
  currentFeatures: AudioFeatures | null;
  onMatchSelect?: (match: MatchResult) => void;
  onClearFeatures?: () => void;
}

export const SoundMatcher = ({ currentFeatures, onMatchSelect, onClearFeatures }: SoundMatcherProps) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  const findSimilarSounds = async () => {
    if (!currentFeatures) {
      toast.error("No sound to match");
      return;
    }

    setIsMatching(true);

    try {
      const { data, error } = await supabase.functions.invoke("match-sounds", {
        body: { targetFeatures: currentFeatures },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setMatches(data.matches || []);
      
      if (data.matches && data.matches.length > 0) {
        toast.success(`Found ${data.matches.length} similar sounds!`);
      } else {
        toast("No similar sounds found in library");
      }
    } catch (error) {
      console.error("Match error:", error);
      toast.error("Failed to find similar sounds");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Sound Match AI
          </span>
        </div>
        <div className="flex gap-2">
          {currentFeatures && onClearFeatures && (
            <button
              onClick={onClearFeatures}
              className="px-2 py-1 rounded text-xs font-medium uppercase tracking-wider transition-all bg-synth-deep border-2 border-synth-border text-muted-foreground hover:border-primary/50"
              title="Clear and re-analyze"
            >
              Clear
            </button>
          )}
          <button
            onClick={findSimilarSounds}
            disabled={!currentFeatures || isMatching}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-1",
              !currentFeatures || isMatching
                ? "bg-synth-deep border-2 border-synth-border text-muted-foreground cursor-not-allowed"
                : "bg-accent/20 border-2 border-accent text-accent hover:bg-accent/30 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
            )}
          >
            {isMatching ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <Sparkles size={12} />
                Find Similar
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {matches.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-8">
            {isMatching ? (
              "Analyzing sounds with AI..."
            ) : currentFeatures ? (
              <>
                <div className="text-accent mb-2">✓ Audio analyzed</div>
                Click 'Find Similar' to discover matches in your library
              </>
            ) : (
              "Play any note to analyze and find similar sounds"
            )}
          </div>
        ) : (
          matches.map((match, index) => (
            <div
              key={match.id}
              onClick={() => onMatchSelect?.(match)}
              className="bg-synth-deep border border-synth-border rounded p-3 hover:border-accent transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-accent text-xs font-bold">#{index + 1}</span>
                    <span className="text-foreground text-xs font-medium truncate">
                      {match.sample.name}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {match.sample.duration.toFixed(1)}s • {match.sample.category}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-accent text-xs font-bold">
                    {(match.similarity * 100).toFixed(0)}%
                  </div>
                  <div className="w-12 h-1.5 bg-synth-deep rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all rounded-full",
                        match.similarity > 0.8
                          ? "bg-accent"
                          : match.similarity > 0.6
                          ? "bg-primary"
                          : "bg-muted-foreground"
                      )}
                      style={{ width: `${match.similarity * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-muted-foreground text-[10px] leading-relaxed">
                {match.reason}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
