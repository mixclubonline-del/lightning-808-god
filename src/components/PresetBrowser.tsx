import { useState, useEffect } from "react";
import { Search, Download, Cloud, Filter, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCloudPresets } from "@/hooks/useCloudPresets";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PresetBrowserProps {
  onDownload: (presetId: string) => void;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "bass", label: "Bass" },
  { value: "lead", label: "Lead" },
  { value: "pad", label: "Pad" },
  { value: "pluck", label: "Pluck" },
  { value: "fx", label: "FX" },
  { value: "uncategorized", label: "Uncategorized" },
];

export const PresetBrowser = ({ onDownload }: PresetBrowserProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { cloudPresets, loading, fetchCloudPresets } = useCloudPresets();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCloudPresets(searchTerm, selectedCategory);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory]);

  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Cloud Presets
          </h3>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search presets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-8 h-9 bg-synth-deep border-synth-border"
            />
            {searchTerm && (
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-9 bg-synth-deep border-synth-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preset List */}
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full bg-synth-deep" />
              ))}
            </div>
          ) : cloudPresets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No presets found
            </div>
          ) : (
            <div className="space-y-2">
              {cloudPresets.map((preset) => (
                <Card
                  key={preset.id}
                  className="p-3 bg-synth-deep border-synth-border hover:border-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {preset.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs bg-synth-panel/50"
                        >
                          {preset.category}
                        </Badge>
                      </div>
                      
                      {preset.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {preset.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {preset.author && <span>by {preset.author}</span>}
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {preset.downloads}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownload(preset.id)}
                      className="shrink-0"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Load
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
};
