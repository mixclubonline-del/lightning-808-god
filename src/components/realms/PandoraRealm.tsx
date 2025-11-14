import { PandoraLibrary } from "@/components/PandoraLibrary";
import { MnemosyneRecorder } from "@/components/MnemosyneRecorder";
import { Package } from "lucide-react";

interface PandoraRealmProps {
  onLoadPreset: () => void;
}

export function PandoraRealm({ onLoadPreset }: PandoraRealmProps) {
  return (
    <div className="relative min-h-full p-8 bg-gradient-to-b from-purple-950/20 to-transparent">
      {/* Realm Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 text-purple-500">
          <Package className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(168,85,247,0.6)' }}>
            PANDORA REALM
          </h1>
          <Package className="w-8 h-8" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1 tracking-wider">Library & Presets</p>
      </div>

      {/* Pandora Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Package className="w-[600px] h-[600px]" />
      </div>

      <div className="relative mt-24 space-y-6">
        <PandoraLibrary onLoadPreset={onLoadPreset} />
        <MnemosyneRecorder />
      </div>
    </div>
  );
}
