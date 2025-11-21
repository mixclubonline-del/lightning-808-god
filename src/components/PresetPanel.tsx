import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Trash2,
  Edit2,
  Check,
  X,
  Package,
  Sparkles,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Preset } from "@/types/preset";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadPresetFile } from "@/utils/presetIO";

interface PresetPanelProps {
  presets: (Preset | null)[];
  currentPresetIndex: number | null;
  onLoad: (index: number) => void;
  onSave: (index: number) => void;
  onDelete: (index: number) => void;
  onRename: (index: number, name: string) => void;
  onInitialize: (index: number) => void;
  onImport?: (preset: Preset) => void;
  onExport?: (index: number) => void;
}

export const PresetPanel = ({
  presets,
  currentPresetIndex,
  onLoad,
  onSave,
  onDelete,
  onRename,
  onInitialize,
  onImport,
  onExport,
}: PresetPanelProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditName(currentName);
  };

  const handleConfirmEdit = (index: number) => {
    if (editName.trim()) {
      onRename(index, editName.trim());
    }
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditName("");
  };

  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Presets
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Sparkles className="w-4 h-4 text-accent ml-auto cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 text-xs">
                  <p><strong>Load:</strong> Click slot or press 1-9</p>
                  <p><strong>Save:</strong> Ctrl+1-9</p>
                  <p><strong>Init:</strong> Double-click empty slot</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Preset Slots */}
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset, index) => (
            <div
              key={index}
              className={cn(
                "relative group rounded-lg border-2 transition-all duration-200",
                currentPresetIndex === index
                  ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  : preset
                  ? "border-synth-border bg-synth-deep hover:border-accent"
                  : "border-synth-border bg-synth-deep/50 border-dashed hover:border-accent/50"
              )}
            >
              {/* Preset Content */}
              <button
                onClick={() => preset && onLoad(index)}
                onDoubleClick={() => !preset && onInitialize(index)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className="text-xs mb-1 bg-synth-deep/50"
                    >
                      {index + 1}
                    </Badge>
                    {preset ? (
                      editingIndex === index ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-6 text-xs py-0 px-1"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === "Enter") handleConfirmEdit(index);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            autoFocus
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmEdit(index);
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-foreground truncate">
                          {preset.name}
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        Empty
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {/* Action Buttons */}
              {preset && editingIndex !== index && (
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 bg-synth-panel/90 hover:bg-synth-panel"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(index, preset.name);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Rename</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 bg-synth-panel/90 hover:bg-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 bg-synth-panel/90 hover:bg-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSave(index);
                          }}
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Overwrite (Ctrl+{index + 1})</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {onExport && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 bg-synth-panel/90 hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              onExport(index);
                            }}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Import/Export Actions */}
        {(onImport || onExport) && (
          <div className="flex gap-2 pt-2 border-t border-synth-border">
            {onExport && currentPresetIndex !== null && presets[currentPresetIndex] && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport(currentPresetIndex)}
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Export Current
              </Button>
            )}
          </div>
        )}

        {/* Quick Reference */}
        <div className="pt-2 border-t border-synth-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="flex justify-between">
              <span>Load:</span>
              <span className="text-accent">1-9</span>
            </p>
            <p className="flex justify-between">
              <span>Save:</span>
              <span className="text-primary">Ctrl + 1-9</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
