import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";
import { useTheme, ThemeName } from "@/hooks/useTheme";
import { useState } from "react";

const themeInfo: Record<ThemeName, { name: string; description: string; icon: string; preview: string }> = {
  olympus: {
    name: "Mount Olympus",
    description: "Fiery red & gold - Zeus theme",
    icon: "⚡",
    preview: "linear-gradient(135deg, hsl(0, 84%, 60%), hsl(25, 95%, 53%))",
  },
  hades: {
    name: "Underworld",
    description: "Dark purple - Hades theme",
    icon: "💀",
    preview: "linear-gradient(135deg, hsl(270, 80%, 60%), hsl(290, 95%, 55%))",
  },
  poseidon: {
    name: "Ocean Depths",
    description: "Deep blue & cyan - Poseidon theme",
    icon: "🔱",
    preview: "linear-gradient(135deg, hsl(190, 85%, 55%), hsl(175, 95%, 50%))",
  },
  apollo: {
    name: "Solar Radiance",
    description: "Brilliant gold - Apollo theme",
    icon: "☀️",
    preview: "linear-gradient(135deg, hsl(45, 100%, 55%), hsl(35, 100%, 55%))",
  },
  artemis: {
    name: "Moonlit Forest",
    description: "Emerald green - Artemis theme",
    icon: "🌙",
    preview: "linear-gradient(135deg, hsl(150, 70%, 50%), hsl(140, 85%, 50%))",
  },
};

export const ThemeSwitcher = () => {
  const { currentTheme, switchTheme, themes } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Visual Theme
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 text-xs"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>

        {/* Current Theme Display */}
        <div className="p-3 bg-synth-deep rounded-lg border border-synth-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border-2 border-synth-border shadow-lg"
              style={{ background: themeInfo[currentTheme].preview }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{themeInfo[currentTheme].icon}</span>
                <span className="text-sm font-bold text-foreground truncate">
                  {themeInfo[currentTheme].name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {themeInfo[currentTheme].description}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Options */}
        {isExpanded && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {themes.map((theme) => {
              const info = themeInfo[theme];
              const isActive = currentTheme === theme;

              return (
                <button
                  key={theme}
                  onClick={() => switchTheme(theme)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 group ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-synth-border bg-synth-deep hover:border-synth-border/60 hover:bg-synth-panel"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Theme Preview */}
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-synth-border shadow-md transition-transform group-hover:scale-105"
                      style={{ background: info.preview }}
                    />
                    
                    {/* Theme Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{info.icon}</span>
                        <span className={`text-sm font-bold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                          {info.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {info.description}
                      </p>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="flex-shrink-0">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="pt-2 border-t border-synth-border text-xs text-muted-foreground">
          <p>Choose your divine aesthetic</p>
        </div>
      </div>
    </Card>
  );
};
