import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, Repeat, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ApolloPianoRollProps {
  onNoteOn: (note: number, velocity?: number) => void;
  onNoteOff: (note: number) => void;
}

interface NoteEvent {
  note: number;
  step: number;
  velocity: number;
}

type Pattern = Map<string, NoteEvent>;

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function buildNoteRows(lowOctave: number, highOctave: number) {
  const rows: { name: string; midi: number }[] = [];
  for (let oct = highOctave; oct >= lowOctave; oct--) {
    for (let i = NOTE_NAMES.length - 1; i >= 0; i--) {
      rows.push({ name: `${NOTE_NAMES[i]}${oct}`, midi: (oct + 1) * 12 + i });
    }
  }
  return rows;
}

const key = (note: number, step: number) => `${note}-${step}`;

export function ApolloPianoRoll({ onNoteOn, onNoteOff }: ApolloPianoRollProps) {
  const noteRows = buildNoteRows(3, 4);
  const [stepCount, setStepCount] = useState(16);
  const [patterns, setPatterns] = useState<Pattern[]>(() =>
    Array.from({ length: 4 }, () => new Map<string, NoteEvent>())
  );
  const [activePattern, setActivePattern] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(-1);
  const [draggingVelocity, setDraggingVelocity] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const stepRef = useRef(-1);
  const activeNotesRef = useRef<Set<number>>(new Set());
  const patternRef = useRef(patterns[activePattern]);

  useEffect(() => {
    patternRef.current = patterns[activePattern];
  }, [patterns, activePattern]);

  const notes = patterns[activePattern];

  const toggleNote = useCallback(
    (midi: number, step: number) => {
      setPatterns((prev) => {
        const next = [...prev];
        const map = new Map(next[activePattern]);
        const k = key(midi, step);
        if (map.has(k)) {
          map.delete(k);
        } else {
          map.set(k, { note: midi, step, velocity: 100 });
        }
        next[activePattern] = map;
        return next;
      });
    },
    [activePattern]
  );

  const setVelocity = useCallback(
    (midi: number, step: number, velocity: number) => {
      setPatterns((prev) => {
        const next = [...prev];
        const map = new Map(next[activePattern]);
        const k = key(midi, step);
        const existing = map.get(k);
        if (existing) {
          map.set(k, { ...existing, velocity: Math.max(1, Math.min(127, velocity)) });
          next[activePattern] = map;
        }
        return next;
      });
    },
    [activePattern]
  );

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    activeNotesRef.current.forEach((n) => onNoteOff(n));
    activeNotesRef.current.clear();
    setIsPlaying(false);
    setCurrentStep(-1);
    stepRef.current = -1;
  }, [onNoteOff]);

  const play = useCallback(() => {
    stop();
    setIsPlaying(true);
    const msPerStep = (60 / bpm / 4) * 1000;

    const tick = () => {
      // release previous notes
      activeNotesRef.current.forEach((n) => onNoteOff(n));
      activeNotesRef.current.clear();

      stepRef.current += 1;
      if (stepRef.current >= stepCount) {
        if (!isLooping) {
          stop();
          return;
        }
        stepRef.current = 0;
      }

      setCurrentStep(stepRef.current);

      const pat = patternRef.current;
      pat.forEach((evt) => {
        if (evt.step === stepRef.current) {
          onNoteOn(evt.note, evt.velocity);
          activeNotesRef.current.add(evt.note);
        }
      });
    };

    tick();
    intervalRef.current = setInterval(tick, msPerStep);
  }, [bpm, stepCount, isLooping, stop, onNoteOn, onNoteOff]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      activeNotesRef.current.forEach((n) => onNoteOff(n));
    };
  }, [onNoteOff]);

  // Restart playback when bpm changes during play
  useEffect(() => {
    if (isPlaying) {
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

  const isBlackKey = (name: string) => name.includes("#");

  // Collect active notes per step for velocity lane
  const velocityPerStep: { step: number; note: number; velocity: number }[] = [];
  notes.forEach((evt) => velocityPerStep.push(evt));

  return (
    <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "secondary" : "default"}
            onClick={isPlaying ? stop : play}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant={isLooping ? "default" : "outline"}
            onClick={() => setIsLooping(!isLooping)}
            className="h-8 w-8 p-0"
          >
            <Repeat className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>BPM</span>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Math.max(40, Math.min(300, Number(e.target.value))))}
              className="w-12 bg-background border border-border rounded px-1 py-0.5 text-xs text-foreground text-center"
            />
          </div>
          <select
            value={stepCount}
            onChange={(e) => setStepCount(Number(e.target.value))}
            className="bg-background border border-border rounded px-1 py-0.5 text-xs text-foreground"
          >
            <option value={16}>16 steps</option>
            <option value={32}>32 steps</option>
          </select>
        </div>

        {/* Pattern selector */}
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <Button
              key={i}
              size="sm"
              variant={activePattern === i ? "default" : "outline"}
              onClick={() => setActivePattern(i)}
              className="h-7 w-7 p-0 text-xs"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Step numbers */}
          <div className="flex">
            <div className="w-10 shrink-0" />
            {Array.from({ length: stepCount }).map((_, s) => (
              <div
                key={s}
                className={`flex-1 text-center text-[9px] font-mono ${
                  s % 4 === 0 ? "text-foreground" : "text-muted-foreground/50"
                } ${currentStep === s ? "text-primary font-bold" : ""}`}
              >
                {s + 1}
              </div>
            ))}
          </div>

          {/* Note rows */}
          <div className="border border-border/30 rounded overflow-hidden">
            {noteRows.map((row) => (
              <div key={row.midi} className="flex">
                <div
                  className={`w-10 shrink-0 text-[9px] font-mono px-1 py-px flex items-center border-r border-border/20 ${
                    isBlackKey(row.name)
                      ? "bg-muted/60 text-muted-foreground"
                      : "bg-card text-foreground"
                  }`}
                >
                  {row.name}
                </div>
                {Array.from({ length: stepCount }).map((_, s) => {
                  const k = key(row.midi, s);
                  const evt = notes.get(k);
                  const isActive = !!evt;
                  const isPlayhead = currentStep === s;
                  const isBeat = s % 4 === 0;

                  return (
                    <div
                      key={s}
                      onClick={() => toggleNote(row.midi, s)}
                      className={`flex-1 h-[14px] border-r border-b cursor-pointer transition-colors
                        ${isBeat ? "border-border/40" : "border-border/15"}
                        ${isPlayhead ? "bg-primary/20" : ""}
                        ${
                          isActive
                            ? "bg-primary hover:bg-primary/80"
                            : isBlackKey(row.name)
                            ? "bg-muted/30 hover:bg-muted/50"
                            : "bg-card/50 hover:bg-muted/30"
                        }`}
                      style={
                        isActive
                          ? { opacity: 0.4 + (evt!.velocity / 127) * 0.6 }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Velocity lane */}
          <div className="mt-1">
            <div className="text-[9px] text-muted-foreground mb-0.5">Velocity</div>
            <div className="flex">
              <div className="w-10 shrink-0" />
              {Array.from({ length: stepCount }).map((_, s) => {
                const stepNotes = velocityPerStep.filter((v) => v.step === s);
                const maxVel = stepNotes.length > 0 ? Math.max(...stepNotes.map((n) => n.velocity)) : 0;
                const heightPct = (maxVel / 127) * 100;

                return (
                  <div
                    key={s}
                    className="flex-1 h-8 flex items-end px-px cursor-ns-resize"
                    onMouseDown={(e) => {
                      if (stepNotes.length === 0) return;
                      setDraggingVelocity(true);
                      const rect = e.currentTarget.getBoundingClientRect();
                      const updateVel = (clientY: number) => {
                        const pct = 1 - (clientY - rect.top) / rect.height;
                        const vel = Math.round(pct * 127);
                        stepNotes.forEach((n) => setVelocity(n.note, n.step, vel));
                      };
                      updateVel(e.clientY);
                      const onMove = (me: MouseEvent) => updateVel(me.clientY);
                      const onUp = () => {
                        setDraggingVelocity(false);
                        window.removeEventListener("mousemove", onMove);
                        window.removeEventListener("mouseup", onUp);
                      };
                      window.addEventListener("mousemove", onMove);
                      window.addEventListener("mouseup", onUp);
                    }}
                  >
                    <div
                      className="w-full bg-primary/70 rounded-t-sm transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
