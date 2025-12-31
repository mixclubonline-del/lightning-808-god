import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { DeityName, DEITY_CONFIG } from '@/types/deity';
import { useDeityChat } from '@/hooks/useDeityChat';
import { useDeityVoice } from '@/hooks/useDeityVoice';
import { DeityAvatar } from './DeityAvatar';
import { DeityVoiceVisualizer } from './DeityVoiceVisualizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface DeityChatProps {
  deity: DeityName;
  isOpen: boolean;
  onClose: () => void;
  context?: Record<string, unknown>;
  className?: string;
}

export function DeityChat({
  deity,
  isOpen,
  onClose,
  context,
  className,
}: DeityChatProps) {
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSpokenMessageRef = useRef<string | null>(null);
  
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    initializeWithGreeting,
  } = useDeityChat(deity, context);

  const {
    isSpeaking,
    isLoading: isVoiceLoading,
    audioData,
    speak,
    stop,
  } = useDeityVoice(deity);

  const config = DEITY_CONFIG[deity];

  // Initialize with greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeWithGreeting();
    }
  }, [isOpen, messages.length, initializeWithGreeting]);

  // Auto-speak deity messages when voice is enabled
  useEffect(() => {
    if (!voiceEnabled || isLoading) return;
    
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === 'deity' &&
      lastMessage.content &&
      lastMessage.content !== lastSpokenMessageRef.current
    ) {
      lastSpokenMessageRef.current = lastMessage.content;
      speak(lastMessage.content);
    }
  }, [messages, voiceEnabled, isLoading, speak]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Stop voice when closing
  const handleClose = () => {
    stop();
    onClose();
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 w-96 h-[500px] z-50',
        'rounded-2xl border backdrop-blur-xl',
        'flex flex-col overflow-hidden',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        className
      )}
      style={{
        borderColor: `${config.color}40`,
        background: `linear-gradient(135deg, hsl(var(--background))95%, ${config.color}10)`,
        boxShadow: `0 0 40px ${config.color}20, 0 0 80px ${config.color}10`,
      }}
    >
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: `${config.color}30` }}
      >
        <DeityAvatar
          deity={deity}
          size="sm"
          isSpeaking={isSpeaking || isVoiceLoading}
          isActive
        />
        <div className="flex-1">
          <h3
            className="font-bold text-lg"
            style={{ color: config.accentColor }}
          >
            {config.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isSpeaking ? 'Speaking...' : config.title}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoice}
          className={cn(
            "hover:bg-background/50 transition-colors",
            voiceEnabled && "text-primary"
          )}
          title={voiceEnabled ? "Mute voice" : "Enable voice"}
        >
          {voiceEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="hover:bg-background/50"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Voice Visualizer */}
      {voiceEnabled && (
        <div className="px-4 py-2">
          <DeityVoiceVisualizer
            audioData={audioData}
            color={config.color}
            accentColor={config.accentColor}
            isActive={isSpeaking}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {message.role === 'deity' && (
                <DeityAvatar deity={deity} size="sm" />
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'border'
                )}
                style={
                  message.role === 'deity'
                    ? {
                        borderColor: `${config.color}40`,
                        background: `${config.color}10`,
                      }
                    : undefined
                }
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'deity' && (
            <div className="flex gap-3">
              <DeityAvatar deity={deity} size="sm" isSpeaking />
              <div
                className="rounded-2xl px-4 py-2 border"
                style={{
                  borderColor: `${config.color}40`,
                  background: `${config.color}10`,
                }}
              >
                <div className="flex gap-1">
                  <Sparkles className="w-4 h-4 animate-pulse" style={{ color: config.accentColor }} />
                  <span className="text-sm text-muted-foreground">Channeling divine wisdom...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-sm text-destructive py-2">
              {error}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex gap-2"
        style={{ borderColor: `${config.color}30` }}
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${config.name}...`}
          disabled={isLoading}
          className="flex-1 bg-background/50 border-border/50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          style={{
            background: config.color,
          }}
          className="hover:opacity-90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
