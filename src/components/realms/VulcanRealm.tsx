import { DraggableEffectModule } from "@/components/DraggableEffectModule";
import { VulcanForge } from "@/components/VulcanForge";
import { SignalFlowView } from "@/components/SignalFlowView";
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

        {/* Draggable Effects Grid */}
        <div className="grid grid-cols-2 gap-6">
          <DraggableEffectModule
            type="delay"
            enabled={props.delayEnabled}
            onToggle={props.setDelayEnabled}
            time={props.delayTime}
            feedback={props.delayFeedback}
            mix={props.delayMix}
            onTimeChange={props.setDelayTime}
            onFeedbackChange={props.setDelayFeedback}
            onMixChange={props.setDelayMix}
          />
          
          <DraggableEffectModule
            type="chorus"
            enabled={props.chorusEnabled}
            onToggle={props.setChorusEnabled}
            rate={props.chorusRate}
            depth={props.chorusDepth}
            mix={props.chorusMix}
            onRateChange={props.setChorusRate}
            onDepthChange={props.setChorusDepth}
            onMixChange={props.setChorusMix}
          />

          <DraggableEffectModule
            type="reverb"
            enabled={props.reverbEnabled}
            onToggle={props.setReverbEnabled}
            size={props.reverbSize}
            damping={props.reverbDamping}
            mix={props.reverbMix}
            onSizeChange={props.setReverbSize}
            onDampingChange={props.setReverbDamping}
            onMixChange={props.setReverbMix}
          />

          <DraggableEffectModule
            type="marsverb"
            enabled={props.marsEnabled}
            onToggle={props.setMarsEnabled}
            size={props.marsSize}
            damping={props.marsDamping}
            mix={props.marsMix}
            onSizeChange={props.setMarsSize}
            onDampingChange={props.setMarsDamping}
            onMixChange={props.setMarsMix}
          />

          <DraggableEffectModule
            type="chronosverb"
            enabled={props.chronosEnabled}
            onToggle={props.setChronosEnabled}
            size={props.chronosSize}
            damping={props.chronosDamping}
            mix={props.chronosMix}
            onSizeChange={props.setChronosSize}
            onDampingChange={props.setChronosDamping}
            onMixChange={props.setChronosMix}
          />

          <DraggableEffectModule
            type="morpheus"
            enabled={props.morpheusEnabled}
            onToggle={props.setMorpheusEnabled}
            depth={props.morpheusDepth}
            rate={props.morpheusRate}
            mix={props.morpheusMix}
            onDepthChange={props.setMorpheusDepth}
            onRateChange={props.setMorpheusRate}
            onMixChange={props.setMorpheusMix}
          />

          <DraggableEffectModule
            type="atlas"
            enabled={props.atlasEnabled}
            onToggle={props.setAtlasEnabled}
            threshold={props.atlasThreshold}
            ratio={props.atlasRatio}
            mix={props.atlasMix}
            onThresholdChange={props.setAtlasThreshold}
            onRatioChange={props.setAtlasRatio}
            onMixChange={props.setAtlasMix}
          />
        </div>

        {/* Signal Flow */}
        <SignalFlowView />
      </div>
    </div>
  );
}
