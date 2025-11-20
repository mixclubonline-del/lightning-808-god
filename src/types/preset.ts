export interface Preset {
  id: string;
  name: string;
  config: PresetConfig;
  createdAt: number;
  updatedAt: number;
}

export interface PresetConfig {
  wave: number;
  filter: number;
  vibrato: number;
  gain: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  reverb: number;
  resonance: number;
  distortionDrive: number;
  distortionTone: number;
  distortionMix: number;
  // Velocity sensitivity
  velocityCurve: "linear" | "exponential" | "logarithmic";
  velocityToVolume: number;
  velocityToFilter: number;
  // Master controls
  masterVolume: number;
  limiterEnabled: boolean;
  limiterThreshold: number;
}

export const DEFAULT_PRESET_CONFIG: PresetConfig = {
  wave: 25,
  filter: 50,
  vibrato: 0,
  gain: 80,
  attack: 5,
  decay: 30,
  sustain: 70,
  release: 20,
  reverb: 20,
  resonance: 30,
  distortionDrive: 0,
  distortionTone: 50,
  distortionMix: 0,
  velocityCurve: "linear",
  velocityToVolume: 80,
  velocityToFilter: 50,
  masterVolume: 80,
  limiterEnabled: true,
  limiterThreshold: 90,
};

export const PRESET_SLOTS = 9;
