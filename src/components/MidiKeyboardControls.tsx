import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Piano, Keyboard, Activity } from "lucide-react";
import { midiHandler } from "@/utils/midiHandler";
import { keyboardMapper } from "@/utils/keyboardMapper";

interface MidiKeyboardControlsProps {
  onMidiEnabled?: (enabled: boolean) => void;
  onKeyboardEnabled?: (enabled: boolean) => void;
}

export const MidiKeyboardControls = ({
  onMidiEnabled,
  onKeyboardEnabled,
}: MidiKeyboardControlsProps) => {
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiDevices, setMidiDevices] = useState<string[]>([]);
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const [currentOctave, setCurrentOctave] = useState(4);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    // Initialize MIDI
    const initMidi = async () => {
      const success = await midiHandler.initialize();
      if (success) {
        updateMidiDevices();
      }
    };
    initMidi();

    // Update active keys periodically when keyboard is enabled
    let interval: NodeJS.Timeout;
    if (keyboardEnabled) {
      interval = setInterval(() => {
        setActiveKeys(keyboardMapper.getActiveKeys());
        setCurrentOctave(keyboardMapper.getCurrentOctave());
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [keyboardEnabled]);

  const updateMidiDevices = () => {
    const devices = midiHandler.getConnectedDevices();
    setMidiDevices(devices);
  };

  const handleMidiToggle = (enabled: boolean) => {
    setMidiEnabled(enabled);
    onMidiEnabled?.(enabled);
    if (enabled) {
      updateMidiDevices();
    }
  };

  const handleKeyboardToggle = (enabled: boolean) => {
    setKeyboardEnabled(enabled);
    if (enabled) {
      keyboardMapper.enable();
    } else {
      keyboardMapper.disable();
      setActiveKeys([]);
    }
    onKeyboardEnabled?.(enabled);
  };

  return (
    <Card className="p-4 bg-synth-panel border-synth-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Input Controls
          </h3>
        </div>

        {/* MIDI Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Piano className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">MIDI Input</span>
            </div>
            <Switch
              checked={midiEnabled}
              onCheckedChange={handleMidiToggle}
            />
          </div>

          {midiEnabled && (
            <div className="pl-6 space-y-1">
              {midiDevices.length > 0 ? (
                midiDevices.map((device, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground">{device}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No MIDI devices connected</span>
              )}
            </div>
          )}
        </div>

        {/* Computer Keyboard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Computer Keyboard</span>
            </div>
            <Switch
              checked={keyboardEnabled}
              onCheckedChange={handleKeyboardToggle}
            />
          </div>

          {keyboardEnabled && (
            <div className="pl-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Octave:</span>
                <Badge variant="outline" className="text-xs">
                  C{currentOctave}
                </Badge>
                <span className="text-xs text-muted-foreground/60">(Z/X to change)</span>
              </div>
              
              {activeKeys.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {activeKeys.map(key => (
                    <Badge key={key} className="text-xs bg-primary/20 text-primary">
                      {key.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground/60 space-y-1 mt-2 p-2 bg-synth-deep rounded">
                <p>White keys: A S D F G H J K</p>
                <p>Black keys: W E T Y U</p>
                <p>Octave: Z (down) / X (up)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
