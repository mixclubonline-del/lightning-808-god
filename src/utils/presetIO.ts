import { Preset, PresetConfig } from "@/types/preset";

export interface PresetExportData {
  version: string;
  preset: Preset;
}

const CURRENT_VERSION = "1.0.0";

/**
 * Export a preset to JSON format
 */
export const exportPresetToJSON = (preset: Preset): string => {
  const exportData: PresetExportData = {
    version: CURRENT_VERSION,
    preset,
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import a preset from JSON string
 */
export const importPresetFromJSON = (jsonString: string): Preset => {
  try {
    const data = JSON.parse(jsonString) as PresetExportData;
    
    if (!data.preset || !data.preset.config) {
      throw new Error("Invalid preset format");
    }

    // Validate that all required config fields exist
    const config = data.preset.config;
    const requiredFields: (keyof PresetConfig)[] = [
      "wave", "filter", "vibrato", "gain", "attack", "decay", 
      "sustain", "release", "reverb", "resonance"
    ];

    for (const field of requiredFields) {
      if (config[field] === undefined) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return {
      ...data.preset,
      id: `preset-imported-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch (error) {
    throw new Error(`Failed to import preset: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

/**
 * Download a preset as a JSON file
 */
export const downloadPresetFile = (preset: Preset): void => {
  const json = exportPresetToJSON(preset);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${preset.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read a preset from a File object
 */
export const readPresetFile = (file: File): Promise<Preset> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const preset = importPresetFromJSON(content);
        resolve(preset);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
