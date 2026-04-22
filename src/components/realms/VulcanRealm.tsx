import { useMemo } from "react";
import { VulcanForge } from "@/components/VulcanForge";
import { SignalFlowView } from "@/components/SignalFlowView";
import { EchoModule } from "@/components/EchoModule";
import { SirenChorus } from "@/components/SirenChorus";
import { ReverbModule } from "@/components/ReverbModule";
import { MarsVerb } from "@/components/MarsVerb";
import { ChronosVerb } from "@/components/ChronosVerb";
import { MorpheusModule } from "@/components/MorpheusModule";
import { AtlasCompressor } from "@/components/AtlasCompressor";
import { ConstellationLines } from "@/components/ConstellationLines";
import { DraggableEffectModule } from "@/components/DraggableEffectModule";
import { HarmoniaChords } from "@/components/HarmoniaChords";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { VulcanRoutingPresets } from "@/components/VulcanRoutingPresets";
import { Flame, ArrowLeftRight } from "lucide-react";

interface VulcanRealmProps {
  distortionDrive: number;
  setDistortionDrive: (v: number) => void;
  distortionTone: number;
  setDistortionTone: (v: number) => void;
  distortionMix: number;
  setDistortionMix: (v: number) => void;
  delayTime: number;
  setDelayTime: (v: number) => void;
  delayFeedback: number;
  setDelayFeedback: (v: number) => void;
  delayMix: number;
  setDelayMix: (v: number) => void;
  delayEnabled: boolean;
  setDelayEnabled: (v: boolean) => void;
  chorusRate: number;
  setChorusRate: (v: number) => void;
  chorusDepth: number;
  setChorusDepth: (v: number) => void;
  chorusMix: number;
  setChorusMix: (v: number) => void;
  chorusEnabled: boolean;
  setChorusEnabled: (v: boolean) => void;
  reverbSize: number;
  setReverbSize: (v: number) => void;
  reverbDamping: number;
  setReverbDamping: (v: number) => void;
  reverbMix: number;
  setReverbMix: (v: number) => void;
  reverbEnabled: boolean;
  setReverbEnabled: (v: boolean) => void;
  marsSize: number;
  setMarsSize: (v: number) => void;
  marsDamping: number;
  setMarsDamping: (v: number) => void;
  marsMix: number;
  setMarsMix: (v: number) => void;
  marsEnabled: boolean;
  setMarsEnabled: (v: boolean) => void;
  chronosSize: number;
  setChronosSize: (v: number) => void;
  chronosDamping: number;
  setChronosDamping: (v: number) => void;
  chronosMix: number;
  setChronosMix: (v: number) => void;
  chronosEnabled: boolean;
  setChronosEnabled: (v: boolean) => void;
  morpheusDepth: number;
  setMorpheusDepth: (v: number) => void;
  morpheusRate: number;
  setMorpheusRate: (v: number) => void;
  morpheusMix: number;
  setMorpheusMix: (v: number) => void;
  morpheusEnabled: boolean;
  setMorpheusEnabled: (v: boolean) => void;
  atlasThreshold: number;
  setAtlasThreshold: (v: number) => void;
  atlasRatio: number;
  setAtlasRatio: (v: number) => void;
  atlasMix: number;
  setAtlasMix: (v: number) => void;
  atlasEnabled: boolean;
  setAtlasEnabled: (v: boolean) => void;
  effectsOrder?: string[];
  onDragStart?: (id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (id: string) => void;
  onDragEnter?: (id: string) => void;
  onDragLeave?: () => void;
  draggedItem?: string | null;
  dragOverItem?: string | null;
  effectLanes?: Record<string, "A" | "B">;
  onToggleLane?: (id: string) => void;
  abCrossfader?: number;
  onAbCrossfaderChange?: (v: number) => void;
  onLoadRoutingPreset?: (preset: {
    lanes: Record<string, "A" | "B">;
    crossfader: number;
    effectsOrder: string[];
  }) => void;
}

export function VulcanRealm(props: VulcanRealmProps) {
  const effectsMap: Record<string, JSX.Element> = {
    vulcan: (
      <VulcanForge
        drive={props.distortionDrive}
        tone={props.distortionTone}
        mix={props.distortionMix}
        onDriveChange={props.setDistortionDrive}
        onToneChange={props.setDistortionTone}
        onMixChange={props.setDistortionMix}
      />
    ),
    echo: (
      <EchoModule
        time={props.delayTime}
        onTimeChange={props.setDelayTime}
        feedback={props.delayFeedback}
        onFeedbackChange={props.setDelayFeedback}
        mix={props.delayMix}
        onMixChange={props.setDelayMix}
        enabled={props.delayEnabled}
        onEnabledChange={props.setDelayEnabled}
      />
    ),
    siren: (
      <SirenChorus
        rate={props.chorusRate}
        onRateChange={props.setChorusRate}
        depth={props.chorusDepth}
        onDepthChange={props.setChorusDepth}
        mix={props.chorusMix}
        onMixChange={props.setChorusMix}
        enabled={props.chorusEnabled}
        onEnabledChange={props.setChorusEnabled}
      />
    ),
    reverb: (
      <ReverbModule
        size={props.reverbSize}
        damping={props.reverbDamping}
        mix={props.reverbMix}
        onSizeChange={props.setReverbSize}
        onDampingChange={props.setReverbDamping}
        onMixChange={props.setReverbMix}
        enabled={props.reverbEnabled}
        onEnabledChange={props.setReverbEnabled}
      />
    ),
    mars: (
      <MarsVerb
        size={props.marsSize}
        shimmer={props.marsDamping}
        mix={props.marsMix}
        onSizeChange={props.setMarsSize}
        onShimmerChange={props.setMarsDamping}
        onMixChange={props.setMarsMix}
        enabled={props.marsEnabled}
        onEnabledChange={props.setMarsEnabled}
      />
    ),
    chronos: (
      <ChronosVerb
        size={props.chronosSize}
        reverse={props.chronosDamping}
        mix={props.chronosMix}
        onSizeChange={props.setChronosSize}
        onReverseChange={props.setChronosDamping}
        onMixChange={props.setChronosMix}
        enabled={props.chronosEnabled}
        onEnabledChange={props.setChronosEnabled}
      />
    ),
    morpheus: (
      <MorpheusModule
        amount={props.morpheusDepth}
        onAmountChange={props.setMorpheusDepth}
        smoothing={props.morpheusRate}
        onSmoothingChange={props.setMorpheusRate}
        mix={props.morpheusMix}
        onMixChange={props.setMorpheusMix}
        enabled={props.morpheusEnabled}
        onEnabledChange={props.setMorpheusEnabled}
      />
    ),
    atlas: (
      <AtlasCompressor
        threshold={props.atlasThreshold}
        onThresholdChange={props.setAtlasThreshold}
        ratio={props.atlasRatio}
        onRatioChange={props.setAtlasRatio}
        attack={50}
        onAttackChange={() => {}}
        release={50}
        onReleaseChange={() => {}}
        enabled={props.atlasEnabled}
        onEnabledChange={props.setAtlasEnabled}
      />
    ),
    harmonia: (
      <HarmoniaChords
        enabled={false}
        onEnabledChange={() => {}}
        chordType="major"
        onChordTypeChange={() => {}}
        inversion={0}
        onInversionChange={() => {}}
        spread={30}
        onSpreadChange={() => {}}
        strum={0}
        onStrumChange={() => {}}
      />
    ),
  };

  const effectsOrder = props.effectsOrder || [
    "vulcan",
    "atlas",
    "echo",
    "siren",
    "reverb",
    "mars",
    "chronos",
    "morpheus",
    "harmonia",
  ];

  const effectLanes = props.effectLanes ?? {};
  const xfade = props.abCrossfader ?? 50;
  // Equal-power crossfader gains
  const aGain = Math.cos((xfade / 100) * (Math.PI / 2));
  const bGain = Math.sin((xfade / 100) * (Math.PI / 2));

  const laneA = effectsOrder.filter((id) => (effectLanes[id] ?? "A") === "A");
  const laneB = effectsOrder.filter((id) => effectLanes[id] === "B");

  // Connections: serial within each lane, both feeding the crossfader
  const dynamicConnections = useMemo(() => {
    const conns: { from: string; to: string }[] = [];
    const buildLane = (lane: string[]) => {
      for (let i = 0; i < lane.length - 1; i++) {
        conns.push({ from: `vulcan-${lane[i]}`, to: `vulcan-${lane[i + 1]}` });
      }
      if (lane.length > 0) {
        conns.push({ from: `vulcan-${lane[lane.length - 1]}`, to: "vulcan-crossfader" });
      }
    };
    buildLane(laneA);
    buildLane(laneB);
    return conns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laneA.join(","), laneB.join(",")]);

  const renderEffect = (effectId: string) => {
    const moduleId = `vulcan-${effectId}`;
    const lane = effectLanes[effectId] ?? "A";
    return (
      <div key={effectId} data-module={moduleId} className="relative">
        {props.onToggleLane && (
          <button
            type="button"
            onClick={() => props.onToggleLane?.(effectId)}
            className="absolute -top-2 -right-2 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-background/80 backdrop-blur hover:scale-110 transition-transform"
            style={{
              borderColor: lane === "A" ? "hsl(24 95% 53%)" : "hsl(200 95% 55%)",
              color: lane === "A" ? "hsl(24 95% 53%)" : "hsl(200 95% 55%)",
            }}
            title={`Lane ${lane} — click to swap`}
          >
            {lane}
          </button>
        )}
        {props.onDragStart && props.onDragOver && props.onDrop ? (
          <DraggableEffectModule
            id={effectId}
            onDragStart={props.onDragStart}
            onDragOver={props.onDragOver}
            onDrop={props.onDrop}
            isDragging={props.draggedItem === effectId}
            isOver={props.dragOverItem === effectId}
          >
            {effectsMap[effectId]}
          </DraggableEffectModule>
        ) : (
          effectsMap[effectId]
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-full p-8 bg-gradient-to-b from-orange-950/20 to-transparent constellation-container">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 text-orange-500">
          <Flame className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(249,115,22,0.6)' }}>
            VULCAN REALM
          </h1>
          <Flame className="w-8 h-8" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1 tracking-wider">Effects Forge — Parallel Routing</p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Flame className="w-[600px] h-[600px]" />
      </div>

      <ConstellationLines connections={dynamicConnections} color="hsl(24, 95%, 53%)" active={true} />

      <div className="relative mt-24 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Lane A */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
              style={{
                borderColor: "hsl(24 95% 53% / 0.5)",
                background: "hsl(24 95% 53% / 0.08)",
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: "hsl(24 95% 53%)" }} />
              <span className="text-sm font-bold tracking-wider" style={{ color: "hsl(24 95% 53%)" }}>
                LANE A
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {Math.round(aGain * 100)}%
              </span>
            </div>
            {laneA.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground italic py-8 border border-dashed rounded-md">
                Empty — assign effects with the lane badge
              </div>
            ) : (
              laneA.map(renderEffect)
            )}
          </div>

          {/* Lane B */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
              style={{
                borderColor: "hsl(200 95% 55% / 0.5)",
                background: "hsl(200 95% 55% / 0.08)",
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: "hsl(200 95% 55%)" }} />
              <span className="text-sm font-bold tracking-wider" style={{ color: "hsl(200 95% 55%)" }}>
                LANE B
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {Math.round(bGain * 100)}%
              </span>
            </div>
            {laneB.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground italic py-8 border border-dashed rounded-md">
                Empty — assign effects with the lane badge
              </div>
            ) : (
              laneB.map(renderEffect)
            )}
          </div>
        </div>

        {/* A/B Crossfader */}
        <div
          data-module="vulcan-crossfader"
          className="rounded-xl border p-5 backdrop-blur"
          style={{
            borderColor: "hsl(24 95% 53% / 0.4)",
            background:
              "linear-gradient(90deg, hsl(24 95% 53% / 0.08), hsl(0 0% 0% / 0.4), hsl(200 95% 55% / 0.08))",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold tracking-wider text-foreground">
                A / B CROSSFADER
              </span>
            </div>
            <div className="flex items-center gap-1">
              {props.onLoadRoutingPreset && (
                <VulcanRoutingPresets
                  currentLanes={effectLanes}
                  currentCrossfader={xfade}
                  currentOrder={effectsOrder}
                  onLoad={(preset) =>
                    props.onLoadRoutingPreset?.({
                      lanes: preset.lanes,
                      crossfader: preset.crossfader,
                      effectsOrder: preset.effectsOrder,
                    })
                  }
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => props.onAbCrossfaderChange?.(50)}
                className="h-7 text-xs"
              >
                Center
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span
              className="text-xs font-bold w-6 text-right"
              style={{ color: "hsl(24 95% 53%)", opacity: 0.4 + aGain * 0.6 }}
            >
              A
            </span>
            <Slider
              value={[xfade]}
              onValueChange={(v) => props.onAbCrossfaderChange?.(v[0])}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span
              className="text-xs font-bold w-6"
              style={{ color: "hsl(200 95% 55%)", opacity: 0.4 + bGain * 0.6 }}
            >
              B
            </span>
          </div>
          <div className="mt-2 text-center text-[11px] text-muted-foreground">
            {xfade === 50 ? "Equal blend" : xfade < 50 ? `Lane A favored (${100 - xfade}%)` : `Lane B favored (${xfade}%)`}
          </div>
        </div>

        <SignalFlowView />
      </div>
    </div>
  );
}
