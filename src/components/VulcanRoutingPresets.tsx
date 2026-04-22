import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Save, Trash2, FolderOpen, Plus } from "lucide-react";
import { toast } from "sonner";

export interface VulcanRoutingPreset {
  name: string;
  lanes: Record<string, "A" | "B">;
  crossfader: number;
  effectsOrder: string[];
  createdAt: number;
}

const STORAGE_KEY = "vulcan-routing-presets-v1";

interface VulcanRoutingPresetsProps {
  currentLanes: Record<string, "A" | "B">;
  currentCrossfader: number;
  currentOrder: string[];
  onLoad: (preset: VulcanRoutingPreset) => void;
}

function loadPresets(): VulcanRoutingPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePresets(presets: VulcanRoutingPreset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    /* non-fatal */
  }
}

export function VulcanRoutingPresets({
  currentLanes,
  currentCrossfader,
  currentOrder,
  onLoad,
}: VulcanRoutingPresetsProps) {
  const [presets, setPresets] = useState<VulcanRoutingPreset[]>([]);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const handleSave = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Give your preset a name");
      return;
    }
    const preset: VulcanRoutingPreset = {
      name,
      lanes: { ...currentLanes },
      crossfader: currentCrossfader,
      effectsOrder: [...currentOrder],
      createdAt: Date.now(),
    };
    const next = [
      preset,
      ...presets.filter((p) => p.name !== name),
    ];
    setPresets(next);
    savePresets(next);
    setNewName("");
    toast.success(`Saved routing preset "${name}"`);
  };

  const handleLoad = (preset: VulcanRoutingPreset) => {
    onLoad(preset);
    setOpen(false);
    toast.success(`Loaded "${preset.name}"`);
  };

  const handleDelete = (name: string) => {
    const next = presets.filter((p) => p.name !== name);
    setPresets(next);
    savePresets(next);
    toast.success(`Deleted "${name}"`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
          <FolderOpen className="w-3.5 h-3.5" />
          Presets
          {presets.length > 0 && (
            <span className="ml-1 text-[10px] text-muted-foreground">
              ({presets.length})
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-3 space-y-3"
        style={{ borderColor: "hsl(24 95% 53% / 0.4)" }}
      >
        {/* Save new */}
        <div className="space-y-2">
          <div className="text-xs font-bold tracking-wider text-foreground">
            Save current routing
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Preset name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!newName.trim()}
              className="h-8 px-2"
              style={{ background: "hsl(24 95% 53%)" }}
            >
              <Save className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Saved list */}
        <div className="space-y-1">
          <div className="text-xs font-bold tracking-wider text-muted-foreground">
            Saved ({presets.length})
          </div>
          {presets.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic py-3 px-2 border border-dashed rounded">
              <Plus className="w-3.5 h-3.5" />
              No presets yet — save your current routing above
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {presets.map((preset) => {
                const aCount = Object.values(preset.lanes).filter(
                  (l) => l === "A"
                ).length;
                const bCount = Object.values(preset.lanes).filter(
                  (l) => l === "B"
                ).length;
                return (
                  <div
                    key={preset.name}
                    className="group flex items-center gap-2 p-2 rounded border bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoad(preset)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="text-xs font-medium truncate text-foreground">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex gap-2">
                        <span style={{ color: "hsl(24 95% 53%)" }}>
                          A:{aCount}
                        </span>
                        <span style={{ color: "hsl(200 95% 55%)" }}>
                          B:{bCount}
                        </span>
                        <span>X:{preset.crossfader}</span>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(preset.name)}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
