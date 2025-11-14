import { useState } from "react";
import { Volume2, Zap, Music, Hammer, Eye, Wind, Package, MousePointer2, Sparkles, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { mythSounds } from "@/utils/mythologicalSounds";
import { Card } from "@/components/ui/card";

interface SoundSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettingsPanel = ({ isOpen, onClose }: SoundSettingsPanelProps) => {
  const [masterVolume, setMasterVolume] = useState(mythSounds.volumes.master * 100);
  const [zeusVolume, setZeusVolume] = useState(mythSounds.volumes.zeus * 100);
  const [apolloVolume, setApolloVolume] = useState(mythSounds.volumes.apollo * 100);
  const [vulcanVolume, setVulcanVolume] = useState(mythSounds.volumes.vulcan * 100);
  const [oracleVolume, setOracleVolume] = useState(mythSounds.volumes.oracle * 100);
  const [hermesVolume, setHermesVolume] = useState(mythSounds.volumes.hermes * 100);
  const [pandoraVolume, setPandoraVolume] = useState(mythSounds.volumes.pandora * 100);
  const [uiVolume, setUiVolume] = useState(mythSounds.volumes.ui * 100);
  const [transitionVolume, setTransitionVolume] = useState(mythSounds.volumes.transition * 100);

  if (!isOpen) return null;

  const handleMasterVolumeChange = (value: number[]) => {
    const vol = value[0];
    setMasterVolume(vol);
    mythSounds.setMasterVolume(vol / 100);
  };

  const handleVolumeChange = (
    type: 'zeus' | 'apollo' | 'vulcan' | 'oracle' | 'hermes' | 'pandora' | 'ui' | 'transition',
    value: number[],
    setter: (val: number) => void
  ) => {
    const vol = value[0];
    setter(vol);
    mythSounds.setVolume(type, vol / 100);
  };

  const soundControls = [
    { name: 'Zeus', icon: Zap, value: zeusVolume, setter: setZeusVolume, type: 'zeus' as const, color: 'from-yellow-500/20 to-yellow-600/20' },
    { name: 'Apollo', icon: Music, value: apolloVolume, setter: setApolloVolume, type: 'apollo' as const, color: 'from-blue-500/20 to-blue-600/20' },
    { name: 'Vulcan', icon: Hammer, value: vulcanVolume, setter: setVulcanVolume, type: 'vulcan' as const, color: 'from-orange-500/20 to-red-600/20' },
    { name: 'Oracle', icon: Eye, value: oracleVolume, setter: setOracleVolume, type: 'oracle' as const, color: 'from-purple-500/20 to-purple-600/20' },
    { name: 'Hermes', icon: Wind, value: hermesVolume, setter: setHermesVolume, type: 'hermes' as const, color: 'from-green-500/20 to-green-600/20' },
    { name: 'Pandora', icon: Package, value: pandoraVolume, setter: setPandoraVolume, type: 'pandora' as const, color: 'from-pink-500/20 to-pink-600/20' },
    { name: 'UI Sounds', icon: MousePointer2, value: uiVolume, setter: setUiVolume, type: 'ui' as const, color: 'from-gray-500/20 to-gray-600/20' },
    { name: 'Transitions', icon: Sparkles, value: transitionVolume, setter: setTransitionVolume, type: 'transition' as const, color: 'from-cyan-500/20 to-cyan-600/20' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-synth-panel border-synth-border shadow-2xl">
        <div className="sticky top-0 bg-synth-panel border-b border-synth-border flex items-center justify-between p-4 z-10">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Sound Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Master Volume */}
          <div className="space-y-3 pb-6 border-b border-synth-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Master Volume</span>
              </div>
              <span className="text-sm text-muted-foreground">{Math.round(masterVolume)}%</span>
            </div>
            <Slider
              value={[masterVolume]}
              onValueChange={handleMasterVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Individual Sound Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Individual Controls</h3>
            <div className="grid gap-4">
              {soundControls.map((control) => {
                const Icon = control.icon;
                return (
                  <div
                    key={control.type}
                    className={`p-4 rounded-lg bg-gradient-to-br ${control.color} border border-border/50`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">{control.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{Math.round(control.value)}%</span>
                    </div>
                    <Slider
                      value={[control.value]}
                      onValueChange={(value) => handleVolumeChange(control.type, value, control.setter)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};