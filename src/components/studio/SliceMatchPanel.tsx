import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AudioSlice {
  buffer: AudioBuffer;
  startTime: number;
  endTime: number;
  index: number;
}

interface MatchResult {
  id: string;
  similarity: number;
  reason: string;
  sample: {
    id: string;
    name: string;
    duration: number;
    category: string;
    file_url: string;
  };
}

interface SliceWithMatches extends AudioSlice {
  sliceId: string;
  matches: MatchResult[];
  isLoading: boolean;
}

interface SliceMatchPanelProps {
  slices: AudioSlice[];
  sliceIds: string[];
  onMatchSelect: (sliceIndex: number, match: MatchResult) => void;
}

export const SliceMatchPanel = ({
  slices,
  sliceIds,
  onMatchSelect,
}: SliceMatchPanelProps) => {
  const [slicesWithMatches, setSlicesWithMatches] = useState<SliceWithMatches[]>(
    slices.map((slice, i) => ({
      ...slice,
      sliceId: sliceIds[i],
      matches: [],
      isLoading: false,
    }))
  );

  const [mode, setMode] = useState<'similar' | 'complementary'>('complementary');
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);

  const findMatches = async (sliceIndex: number) => {
    const slice = slicesWithMatches[sliceIndex];
    
    // Update loading state
    setSlicesWithMatches(prev =>
      prev.map((s, i) => i === sliceIndex ? { ...s, isLoading: true } : s)
    );

    try {
      // Get slice features from database
      const { data: sliceData, error: sliceError } = await supabase
        .from('sound_samples')
        .select('*')
        .eq('id', slice.sliceId)
        .single();

      if (sliceError) throw sliceError;

      // Call match-sounds function
      const { data, error } = await supabase.functions.invoke('match-sounds', {
        body: {
          targetFeatures: {
            spectralCentroid: sliceData.spectral_centroid,
            spectralRolloff: sliceData.spectral_rolloff,
            spectralFlatness: sliceData.spectral_flatness,
            rmsEnergy: sliceData.rms_energy,
            zeroCrossingRate: sliceData.zero_crossing_rate,
            lowFreqEnergy: sliceData.low_freq_energy,
            midFreqEnergy: sliceData.mid_freq_energy,
            highFreqEnergy: sliceData.high_freq_energy,
          },
          mode,
          maxResults: 5,
          excludeSlices: true,
        },
      });

      if (error) throw error;

      setSlicesWithMatches(prev =>
        prev.map((s, i) =>
          i === sliceIndex
            ? { ...s, matches: data.matches, isLoading: false }
            : s
        )
      );

      toast.success(`Found ${data.matches.length} matches`);
    } catch (error) {
      console.error("Match error:", error);
      toast.error("Failed to find matches");
      setSlicesWithMatches(prev =>
        prev.map((s, i) => i === sliceIndex ? { ...s, isLoading: false } : s)
      );
    }
  };

  const playMatch = async (fileUrl: string) => {
    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
    }

    const audio = new Audio(fileUrl);
    audio.play();
    setPlayingAudio(audio);

    audio.onended = () => setPlayingAudio(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-semibold text-foreground">AI Matching</h4>
        <Button
          variant={mode === 'similar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('similar')}
        >
          Similar
        </Button>
        <Button
          variant={mode === 'complementary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('complementary')}
        >
          Complementary
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slicesWithMatches.map((slice, index) => (
          <Card key={index} className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium">Slice {index + 1}</h5>
                <span className="text-xs text-muted-foreground">
                  {slice.buffer.duration.toFixed(2)}s
                </span>
              </div>

              {slice.matches.length === 0 ? (
                <Button
                  onClick={() => findMatches(index)}
                  disabled={slice.isLoading}
                  size="sm"
                  variant="outline"
                >
                  {slice.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Finding...
                    </>
                  ) : (
                    'Find Matches'
                  )}
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  {slice.matches.map((match, matchIndex) => (
                    <div
                      key={matchIndex}
                      className="p-2 bg-muted rounded border border-border flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate">
                          {match.sample.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(match.similarity * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {match.reason}
                      </p>
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => playMatch(match.sample.file_url)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-6 px-2 text-xs"
                          onClick={() => onMatchSelect(index, match)}
                        >
                          <Layers className="w-3 h-3 mr-1" />
                          Layer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
