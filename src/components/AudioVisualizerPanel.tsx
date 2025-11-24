import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaveformVisualizer } from "@/components/visualizers/WaveformVisualizer";
import { SpectrumAnalyzer } from "@/components/visualizers/SpectrumAnalyzer";
import { LevelMeter } from "@/components/visualizers/LevelMeter";
import { FullScreenVisualizer } from "@/components/visualizers/FullScreenVisualizer";
import { Eye, EyeOff, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioVisualizerPanelProps {
  analyser: AnalyserNode | null;
}

export const AudioVisualizerPanel = ({ analyser }: AudioVisualizerPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  if (collapsed) {
    return (
      <Card className="p-2 bg-synth-panel border-synth-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(false)}
          className="w-full gap-2"
        >
          <Eye className="w-4 h-4" />
          <span className="text-xs">Show Visualizers</span>
        </Button>
      </Card>
    );
  }

  return (
    <>
      {fullScreen && (
        <FullScreenVisualizer
          analyser={analyser}
          onClose={() => setFullScreen(false)}
        />
      )}
      
      <Card className="p-4 bg-synth-panel border-synth-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Audio Visualizers
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFullScreen(true)}
              className="h-6 w-6"
              title="Full Screen Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="h-6 w-6"
              title="Hide Visualizers"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

      <Tabs defaultValue="waveform" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-3">
          <TabsTrigger value="waveform" className="text-xs">
            Waveform
          </TabsTrigger>
          <TabsTrigger value="spectrum" className="text-xs">
            Spectrum
          </TabsTrigger>
          <TabsTrigger value="meters" className="text-xs">
            Meters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="waveform" className="mt-0">
          <WaveformVisualizer
            analyser={analyser}
            width={350}
            height={120}
            showLabel={false}
          />
        </TabsContent>

        <TabsContent value="spectrum" className="mt-0">
          <SpectrumAnalyzer
            analyser={analyser}
            width={350}
            height={150}
            showLabel={false}
            barCount={48}
          />
        </TabsContent>

        <TabsContent value="meters" className="mt-0">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Horizontal Meter</p>
              <LevelMeter
                analyser={analyser}
                width={350}
                height={24}
                orientation="horizontal"
              />
            </div>
            <div className="grid grid-cols-8 gap-2">
              <p className="col-span-8 text-xs text-muted-foreground mb-1">
                Multi-Channel Meters
              </p>
              {[...Array(8)].map((_, i) => (
                <LevelMeter
                  key={i}
                  analyser={analyser}
                  width={40}
                  height={100}
                  orientation="vertical"
                  showPeak={true}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
    </>
  );
};
