import { VulcanForge } from "@/components/VulcanForge";
import { SignalFlowView } from "@/components/SignalFlowView";
import { EchoModule } from "@/components/EchoModule";
import { SirenChorus } from "@/components/SirenChorus";
import { ReverbModule } from "@/components/ReverbModule";
import { MarsVerb } from "@/components/MarsVerb";
import { ChronosVerb } from "@/components/ChronosVerb";
import { MorpheusModule } from "@/components/MorpheusModule";
import { AtlasCompressor } from "@/components/AtlasCompressor";
import { Flame } from "lucide-react";

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
}

export function VulcanRealm(props: VulcanRealmProps) {
  return (
    <div className="relative min-h-full p-8 bg-gradient-to-b from-orange-950/20 to-transparent">
      {/* Realm Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 text-orange-500">
          <Flame className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(249,115,22,0.6)' }}>
            VULCAN REALM
          </h1>
          <Flame className="w-8 h-8" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1 tracking-wider">Effects Forge</p>
      </div>

      {/* Vulcan Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Flame className="w-[600px] h-[600px]" />
      </div>

      <div className="relative mt-24 space-y-6">
        {/* Vulcan Master Distortion */}
        <VulcanForge
          drive={props.distortionDrive}
          tone={props.distortionTone}
          mix={props.distortionMix}
          onDriveChange={props.setDistortionDrive}
          onToneChange={props.setDistortionTone}
          onMixChange={props.setDistortionMix}
        />

        {/* Effects Grid */}
        <div className="grid grid-cols-2 gap-6">
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
        </div>

        {/* Signal Flow */}
        <SignalFlowView />
      </div>
    </div>
  );
}
