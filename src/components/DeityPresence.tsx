import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DeityName, DEITY_CONFIG } from '@/types/deity';
import { DeityAvatar } from './DeityAvatar';
import { DeityChat } from './DeityChat';
import { MessageCircle } from 'lucide-react';

interface DeityPresenceProps {
  deity: DeityName;
  context?: Record<string, unknown>;
  className?: string;
}

export function DeityPresence({
  deity,
  context,
  className,
}: DeityPresenceProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const config = DEITY_CONFIG[deity];

  return (
    <>
      {/* Floating deity indicator */}
      <div
        className={cn(
          'fixed bottom-4 right-4 z-40',
          'flex items-center gap-3',
          'transition-all duration-300',
          isChatOpen && 'opacity-0 pointer-events-none',
          className
        )}
      >
        <button
          onClick={() => setIsChatOpen(true)}
          className={cn(
            'group flex items-center gap-3 px-4 py-2 rounded-full',
            'border backdrop-blur-sm transition-all duration-300',
            'hover:scale-105'
          )}
          style={{
            borderColor: `${config.color}40`,
            background: `linear-gradient(135deg, ${config.color}20, transparent)`,
            boxShadow: `0 0 20px ${config.color}30`,
          }}
        >
          <DeityAvatar deity={deity} size="sm" isActive />
          
          <div className="text-left">
            <p
              className="text-sm font-medium"
              style={{ color: config.accentColor }}
            >
              {config.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Click to commune
            </p>
          </div>

          <MessageCircle
            className="w-5 h-5 transition-transform group-hover:scale-110"
            style={{ color: config.accentColor }}
          />
        </button>
      </div>

      {/* Chat panel */}
      <DeityChat
        deity={deity}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        context={context}
      />
    </>
  );
}
