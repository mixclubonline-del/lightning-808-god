import { ReactNode, useState } from "react";
import { Minimize2, Maximize2, X, Settings, FileText, HelpCircle } from "lucide-react";
import { SoundSettingsPanel } from "./SoundSettingsPanel";

interface AppContainerProps {
  children: ReactNode;
}

export const AppContainer = ({ children }: AppContainerProps) => {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="fixed inset-0 flex flex-col bg-synth-deep overflow-hidden rounded-3xl m-2 shadow-2xl">
      {/* Window Chrome / Title Bar */}
      <div className="h-8 bg-gradient-to-b from-synth-panel to-background border-b border-synth-border flex items-center justify-between px-3 select-none rounded-t-3xl">
        {/* App Title */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-xl bg-gradient-to-br from-primary to-synth-accent flex items-center justify-center text-[10px] font-bold shadow-lg">
            ⚡
          </div>
          <span className="text-xs font-semibold text-foreground/90">Lightning 808 God</span>
        </div>

        {/* Menu Bar */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button className="hover:text-foreground transition-colors flex items-center gap-1">
            <FileText className="w-3 h-3" />
            File
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            Settings
          </button>
          <button className="hover:text-foreground transition-colors flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            Help
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2">
          <button className="w-5 h-5 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors">
            <Minimize2 className="w-3 h-3 text-muted-foreground" />
          </button>
          <button className="w-5 h-5 rounded-full hover:bg-muted/50 flex items-center justify-center transition-colors">
            <Maximize2 className="w-3 h-3 text-muted-foreground" />
          </button>
          <button className="w-5 h-5 rounded-full hover:bg-destructive/80 flex items-center justify-center transition-colors">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main App Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gradient-to-t from-synth-panel to-background border-t border-synth-border flex items-center justify-between px-3 text-[10px] text-muted-foreground rounded-b-3xl">
        <div className="flex items-center gap-4">
          <span>CPU: 12%</span>
          <span className="w-px h-3 bg-border" />
          <span>Buffer: 512</span>
          <span className="w-px h-3 bg-border" />
          <span>44.1kHz / 24bit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Ready</span>
        </div>
      </div>

      <SoundSettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};
