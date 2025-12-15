import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { DeityName, DEITY_CONFIG } from '@/types/deity';
import { DeityAvatar } from './DeityAvatar';
import { DeityConsole } from './DeityConsole';
import { ParameterChange } from '@/hooks/useDeityParameters';
import { MessageCircle, Sliders } from 'lucide-react';

interface DeityPresenceProps {
  deity: DeityName;
  currentParameters: Record<string, number>;
  onParameterChange: (changes: ParameterChange) => void;
  className?: string;
}

export function DeityPresence({
  deity,
  currentParameters,
  onParameterChange,
  className,
}: DeityPresenceProps) {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const config = DEITY_CONFIG[deity];

  const handleParameterChange = useCallback((changes: ParameterChange) => {
    onParameterChange(changes);
  }, [onParameterChange]);

  return (
    <>
      {/* Floating deity indicator */}
      <div
        className={cn(
          'fixed bottom-4 right-4 z-40',
          'flex items-center gap-3',
          'transition-all duration-300',
          isConsoleOpen && 'opacity-0 pointer-events-none',
          className
        )}
      >
        <button
          onClick={() => setIsConsoleOpen(true)}
          className={cn(
            'group flex items-center gap-3 px-4 py-3 rounded-2xl',
            'border backdrop-blur-sm transition-all duration-300',
            'hover:scale-105 active:scale-95'
          )}
          style={{
            borderColor: `${config.color}40`,
            background: `linear-gradient(135deg, ${config.color}20, transparent)`,
            boxShadow: `0 0 30px ${config.color}30`,
          }}
        >
          <DeityAvatar deity={deity} size="sm" isActive />
          
          <div className="text-left">
            <p className="text-sm font-bold flex items-center gap-2" style={{ color: config.accentColor }}>
              {config.name}
              <Sliders className="w-3 h-3 opacity-60" />
            </p>
            <p className="text-xs text-muted-foreground">
              Ask me to shape your sound
            </p>
          </div>

          <MessageCircle
            className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-12"
            style={{ color: config.accentColor }}
          />
        </button>
      </div>

      {/* Console panel */}
      <DeityConsole
        deity={deity}
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        currentParameters={currentParameters}
        onParameterChange={handleParameterChange}
      />
    </>
  );
}
