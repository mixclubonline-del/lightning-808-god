import { useState, useEffect, useCallback } from "react";
import { Preset, PresetConfig, DEFAULT_PRESET_CONFIG, PRESET_SLOTS } from "@/types/preset";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "vst-god-presets";

export const usePresets = () => {
  const [presets, setPresets] = useState<(Preset | null)[]>(
    Array(PRESET_SLOTS).fill(null)
  );
  const [currentPresetIndex, setCurrentPresetIndex] = useState<number | null>(null);
  const { toast } = useToast();

  // Load presets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      } catch (error) {
        console.error("Failed to load presets:", error);
      }
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }, [presets]);

  const savePreset = useCallback(
    (index: number, config: PresetConfig, name?: string) => {
      if (index < 0 || index >= PRESET_SLOTS) return;

      const preset: Preset = {
        id: `preset-${index}-${Date.now()}`,
        name: name || `Preset ${index + 1}`,
        config,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setPresets((prev) => {
        const next = [...prev];
        next[index] = preset;
        return next;
      });

      setCurrentPresetIndex(index);

      toast({
        title: "Preset Saved",
        description: `Saved to slot ${index + 1}: ${preset.name}`,
        duration: 2000,
      });
    },
    [toast]
  );

  const loadPreset = useCallback(
    (index: number): PresetConfig | null => {
      if (index < 0 || index >= PRESET_SLOTS) return null;

      const preset = presets[index];
      if (!preset) {
        toast({
          title: "Empty Slot",
          description: `Slot ${index + 1} is empty`,
          variant: "destructive",
          duration: 2000,
        });
        return null;
      }

      setCurrentPresetIndex(index);

      toast({
        title: "Preset Loaded",
        description: `Loaded slot ${index + 1}: ${preset.name}`,
        duration: 2000,
      });

      return preset.config;
    },
    [presets, toast]
  );

  const deletePreset = useCallback(
    (index: number) => {
      if (index < 0 || index >= PRESET_SLOTS) return;

      setPresets((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });

      if (currentPresetIndex === index) {
        setCurrentPresetIndex(null);
      }

      toast({
        title: "Preset Deleted",
        description: `Cleared slot ${index + 1}`,
        duration: 2000,
      });
    },
    [currentPresetIndex, toast]
  );

  const renamePreset = useCallback((index: number, name: string) => {
    if (index < 0 || index >= PRESET_SLOTS) return;

    setPresets((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index]!,
          name,
          updatedAt: Date.now(),
        };
      }
      return next;
    });
  }, []);

  const initializePreset = useCallback(
    (index: number) => {
      savePreset(index, DEFAULT_PRESET_CONFIG, `Init ${index + 1}`);
    },
    [savePreset]
  );

  return {
    presets,
    currentPresetIndex,
    savePreset,
    loadPreset,
    deletePreset,
    renamePreset,
    initializePreset,
  };
};
