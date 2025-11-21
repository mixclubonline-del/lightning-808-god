import { useState } from "react";
import { Share2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PresetConfig } from "@/types/preset";
import { useCloudPresets } from "@/hooks/useCloudPresets";

interface PresetShareDialogProps {
  currentPresetName: string;
  currentConfig: PresetConfig;
}

const CATEGORIES = [
  { value: "bass", label: "Bass" },
  { value: "lead", label: "Lead" },
  { value: "pad", label: "Pad" },
  { value: "pluck", label: "Pluck" },
  { value: "fx", label: "FX" },
  { value: "uncategorized", label: "Uncategorized" },
];

export const PresetShareDialog = ({
  currentPresetName,
  currentConfig,
}: PresetShareDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentPresetName);
  const [category, setCategory] = useState("uncategorized");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const { sharePreset } = useCloudPresets();

  const handleShare = async () => {
    if (!name.trim()) return;

    await sharePreset(name, category, description, author, currentConfig);
    setOpen(false);
    
    // Reset form
    setName(currentPresetName);
    setCategory("uncategorized");
    setDescription("");
    setAuthor("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share to Cloud
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-synth-panel border-synth-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Share Preset to Cloud
          </DialogTitle>
          <DialogDescription>
            Share your preset with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Preset Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-synth-deep border-synth-border"
              placeholder="Enter preset name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-synth-deep border-synth-border">
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-synth-deep border-synth-border resize-none"
              placeholder="Describe your preset..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Your Name (optional)</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-synth-deep border-synth-border"
              placeholder="Your name or alias"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!name.trim()}>
            <Upload className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
