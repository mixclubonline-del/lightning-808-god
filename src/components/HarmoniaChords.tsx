import { Knob } from "./Knob";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";

interface HarmoniaChordsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  chordType: string;
  onChordTypeChange: (type: string) => void;
  inversion: number;
  onInversionChange: (inversion: number) => void;
  spread: number;
  onSpreadChange: (spread: number) => void;
  strum: number;
  onStrumChange: (strum: number) => void;
}

export const HarmoniaChords = ({
  enabled,
  onEnabledChange,
  chordType,
  onChordTypeChange,
  inversion,
  onInversionChange,
  spread,
  onSpreadChange,
  strum,
  onStrumChange,
}: HarmoniaChordsProps) => {
  const chordTypes = [
    { value: "major", label: "Major", notes: "1-3-5" },
    { value: "minor", label: "Minor", notes: "1-♭3-5" },
    { value: "major7", label: "Maj7", notes: "1-3-5-7" },
    { value: "minor7", label: "Min7", notes: "1-♭3-5-♭7" },
    { value: "dom7", label: "Dom7", notes: "1-3-5-♭7" },
    { value: "major9", label: "Maj9", notes: "1-3-5-7-9" },
    { value: "minor9", label: "Min9", notes: "1-♭3-5-♭7-9" },
    { value: "sus2", label: "Sus2", notes: "1-2-5" },
    { value: "sus4", label: "Sus4", notes: "1-4-5" },
    { value: "dim", label: "Dim", notes: "1-♭3-♭5" },
    { value: "aug", label: "Aug", notes: "1-3-♯5" },
  ];

  const inversions = [
    { value: 0, label: "Root" },
    { value: 1, label: "1st" },
    { value: 2, label: "2nd" },
    { value: 3, label: "3rd" },
  ];

  return (
    <div className="bg-synth-panel rounded-lg border-2 border-emerald-500/50 p-4 shadow-[0_0_20px_rgba(16,185,129,0.2)] marble-texture pillar-pattern">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music size={16} className="text-emerald-400" />
          <span className="text-emerald-400 text-sm font-medium uppercase tracking-wider divine-glow"
            style={{
              textShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
            }}>
            Harmonia Chords
          </span>
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={cn(
            "px-3 py-1 rounded text-xs font-medium uppercase tracking-wider transition-all",
            enabled
              ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              : "bg-synth-deep border-2 border-synth-border text-muted-foreground hover:border-emerald-500/50"
          )}
        >
          {enabled ? "ON" : "OFF"}
        </button>
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* Chord Type Selection */}
          <div className="relative">
            <label className="text-xs text-emerald-400/70 uppercase tracking-wider block mb-2">
              Chord Type
            </label>
            <select
              value={chordType}
              onChange={(e) => onChordTypeChange(e.target.value)}
              className="w-full bg-synth-deep border-2 border-emerald-500/30 text-foreground rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer relative z-50"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2310b981\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              {chordTypes.map((type) => (
                <option key={type.value} value={type.value} className="bg-synth-panel text-foreground">
                  {type.label} ({type.notes})
                </option>
              ))}
            </select>
          </div>

          {/* Inversion Selection */}
          <div>
            <label className="text-xs text-emerald-400/70 uppercase tracking-wider block mb-2">
              Inversion
            </label>
            <div className="grid grid-cols-4 gap-2">
              {inversions.map((inv) => (
                <button
                  key={inv.value}
                  onClick={() => onInversionChange(inv.value)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium uppercase tracking-wider transition-all",
                    inversion === inv.value
                      ? "bg-emerald-500/30 border-2 border-emerald-500 text-emerald-400"
                      : "bg-synth-deep border-2 border-emerald-500/20 text-emerald-400/50 hover:border-emerald-500/40"
                  )}
                >
                  {inv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Knobs */}
          <div className="flex justify-around pt-2">
            <Knob label="Spread" value={spread} onChange={onSpreadChange} />
            <Knob label="Strum" value={strum} onChange={onStrumChange} />
          </div>

          <div className="text-center text-emerald-400/60 text-[10px] uppercase tracking-widest pt-2">
            Play chords on Orpheus Keys • Goddess of Harmony
          </div>
        </div>
      )}
    </div>
  );
};