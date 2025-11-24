import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { SpectrumAnalyzer } from "./SpectrumAnalyzer";
import { LevelMeter } from "./LevelMeter";

interface FullScreenVisualizerProps {
  analyser: AnalyserNode | null;
  onClose: () => void;
}

export const FullScreenVisualizer = ({
  analyser,
  onClose,
}: FullScreenVisualizerProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-synth-border bg-synth-panel">
        <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
          Audio Visualizer Dashboard
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-[1600px] mx-auto">
          {/* Waveform - Large */}
          <div className="lg:col-span-2">
            <WaveformVisualizer
              analyser={analyser}
              width={800}
              height={200}
              showLabel={true}
            />
          </div>

          {/* Spectrum Analyzer - Large */}
          <div className="lg:col-span-2">
            <SpectrumAnalyzer
              analyser={analyser}
              width={800}
              height={250}
              showLabel={true}
              barCount={96}
            />
          </div>

          {/* Level Meters Section */}
          <div className="lg:col-span-2">
            <div className="p-4 bg-synth-panel border border-synth-border rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                Level Meters
              </h3>
              
              <div className="space-y-6">
                {/* Master Meter - Horizontal */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Master Output</p>
                  <LevelMeter
                    analyser={analyser}
                    width={800}
                    height={40}
                    orientation="horizontal"
                  />
                </div>

                {/* Multi-Channel Meters - Vertical */}
                <div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Multi-Channel Analysis
                  </p>
                  <div className="grid grid-cols-8 sm:grid-cols-12 lg:grid-cols-16 gap-3 justify-center">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <LevelMeter
                          analyser={analyser}
                          width={32}
                          height={150}
                          orientation="vertical"
                          showPeak={true}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
