import { useEffect } from "react";
import { PresetConfig } from "@/types/preset";

interface UsePresetKeyboardProps {
  onSave: (index: number, config: PresetConfig) => void;
  onLoad: (index: number) => void;
  getCurrentConfig: () => PresetConfig;
  enabled?: boolean;
}

export const usePresetKeyboard = ({
  onSave,
  onLoad,
  getCurrentConfig,
  enabled = true,
}: UsePresetKeyboardProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key;
      const num = parseInt(key);

      // Check if it's a number key 1-9
      if (isNaN(num) || num < 1 || num > 9) return;

      const index = num - 1;

      if (event.ctrlKey || event.metaKey) {
        // Save preset: Ctrl/Cmd + 1-9
        event.preventDefault();
        const config = getCurrentConfig();
        onSave(index, config);
      } else if (!event.shiftKey && !event.altKey) {
        // Load preset: 1-9 (without modifiers)
        event.preventDefault();
        onLoad(index);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSave, onLoad, getCurrentConfig, enabled]);
};
