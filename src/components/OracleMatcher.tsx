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

interface OracleMatcherProps {
  currentFeatures: AudioFeatures | null;
  onMatchSelect?: (match: MatchResult) => void;
  onClearFeatures?: () => void;
}

export const OracleMatcher = ({ currentFeatures, onMatchSelect, onClearFeatures }: OracleMatcherProps) => {
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
    <div className="bg-synth-panel rounded-lg border-2 border-purple-500/50 p-4 h-full flex flex-col shadow-[0_0_20px_rgba(147,51,234,0.2)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-purple-400 text-sm font-medium uppercase tracking-wider"
            style={{
              textShadow: "0 0 10px rgba(147, 51, 234, 0.5)",
            }}>
            Oracle Matcher
          </span>
        </div>
        <div className="flex gap-2">
          {currentFeatures && onClearFeatures && (
            <button
              onClick={onClearFeatures}
              className="px-2 py-1 rounded text-xs font-medium uppercase tracking-wider transition-all bg-synth-deep border-2 border-synth-border text-muted-foreground hover:border-purple-500/50"
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
                : "bg-purple-500/20 border-2 border-purple-500 text-purple-400 hover:bg-purple-500/30 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
            )}
          >
            {isMatching ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Divining...
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
          <div className="text-center text-purple-400/60 text-xs py-8">
            {isMatching ? (
              "Consulting the Oracle..."
            ) : currentFeatures ? (
              <>
                <div className="text-purple-400 mb-2">✓ Audio analyzed</div>
                <div>Click "Find Similar" to divine matches</div>
              </>
            ) : (
              "Upload or analyze audio to divine similar sounds"
            )}
          </div>
        ) : (
          matches.map((match) => (
            <button
              key={match.id}
              onClick={() => onMatchSelect?.(match)}
              className="w-full bg-synth-deep border border-purple-500/30 rounded p-3 hover:border-purple-500 transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-purple-300 text-xs font-medium truncate">
                    {match.sample.name}
                  </div>
                  <div className="text-purple-400/50 text-[10px] mt-1">
                    {match.sample.duration.toFixed(2)}s • {match.sample.category}
                  </div>
                  <div className="text-purple-400 text-[10px] mt-2 italic">
                    {match.reason}
                  </div>
                </div>
                <div className="text-purple-400 text-xs font-bold whitespace-nowrap">
                  {Math.round(match.similarity * 100)}%
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="text-purple-400/50 text-[10px] uppercase tracking-widest text-center mt-2">
        Divine Prophecy AI
      </div>
    </div>
  );
};