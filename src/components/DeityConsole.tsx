import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { DeityName, DEITY_CONFIG, getRandomGreeting, DeityMessage } from '@/types/deity';
import { useDeityChat } from '@/hooks/useDeityChat';
import { useDeityParameters, ParameterChange } from '@/hooks/useDeityParameters';
import { DeityAvatar } from './DeityAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Sparkles, Sliders, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface DeityConsoleProps {
  deity: DeityName;
  isOpen: boolean;
  onClose: () => void;
  currentParameters: Record<string, number>;
  onParameterChange: (changes: ParameterChange) => void;
  className?: string;
}

export function DeityConsole({
  deity,
  isOpen,
  onClose,
  currentParameters,
  onParameterChange,
  className,
}: DeityConsoleProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DeityMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = DEITY_CONFIG[deity];

  const {
    isProcessing: isProcessingParams,
    requestParameterChange,
    isParameterRequest,
  } = useDeityParameters({
    deity,
    currentParameters,
    onApplyChanges: onParameterChange,
  });

  const {
    messages: chatMessages,
    isLoading: isChatLoading,
    sendMessage: sendChatMessage,
    initializeWithGreeting,
  } = useDeityChat(deity, { parameters: currentParameters });

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getRandomGreeting(deity);
      setMessages([{
        role: 'deity',
        content: greeting,
        timestamp: new Date(),
        deity,
      }]);
    }
  }, [isOpen, messages.length, deity]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isProcessingParams) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    // Check if this is a parameter adjustment request
    if (isParameterRequest(userMessage)) {
      setIsLoading(true);

      try {
        const suggestion = await requestParameterChange(userMessage);

        if (suggestion) {
          const changesCount = Object.keys(suggestion.changes).length;

          // Add deity response with parameter changes
          setMessages(prev => [...prev, {
            role: 'deity',
            content: suggestion.deity_response,
            timestamp: new Date(),
            deity,
          }]);

          if (changesCount > 0) {
            toast.success(`${config.name} adjusted ${changesCount} parameter${changesCount > 1 ? 's' : ''}`, {
              description: suggestion.explanation,
            });
          }
        }
      } catch (error) {
        setMessages(prev => [...prev, {
          role: 'deity',
          content: "The divine channels are unclear... try again.",
          timestamp: new Date(),
          deity,
        }]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Regular chat - use streaming
      setIsLoading(true);
      let assistantContent = '';

      const updateAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'deity') {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, {
            role: 'deity' as const,
            content: assistantContent,
            timestamp: new Date(),
            deity,
          }];
        });
      };

      try {
        const apiMessages = messages
          .filter(m => m.content.trim())
          .map(m => ({
            role: m.role === 'deity' ? 'assistant' : 'user',
            content: m.content,
          }));
        apiMessages.push({ role: 'user', content: userMessage });

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deity-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              messages: apiMessages,
              deity,
              context: { parameters: currentParameters },
            }),
          }
        );

        if (!response.ok || !response.body) throw new Error('Stream failed');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let newlineIndex: number;

          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || !line.trim() || !line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) updateAssistant(content);
            } catch {
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 w-[420px] h-[520px] z-50',
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
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: `${config.color}30` }}
      >
        <DeityAvatar
          deity={deity}
          size="sm"
          isSpeaking={isLoading || isProcessingParams}
          isActive
        />
        <div className="flex-1">
          <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: config.accentColor }}>
            {config.name}
            <span className="flex items-center gap-1 text-xs font-normal px-2 py-0.5 rounded-full bg-primary/20">
              <Sliders className="w-3 h-3" />
              Control Mode
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">{config.domain}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-background/50">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 p-3 border-b overflow-x-auto" style={{ borderColor: `${config.color}20` }}>
        {['Make it punchier', 'Add more space', 'Warmer tone', 'Tighter sound'].map(action => (
          <button
            key={action}
            onClick={() => {
              setInput(action);
              setTimeout(() => inputRef.current?.form?.requestSubmit(), 50);
            }}
            className="px-3 py-1.5 text-xs rounded-full border whitespace-nowrap transition-all hover:scale-105"
            style={{
              borderColor: `${config.color}40`,
              color: config.accentColor,
            }}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            {action}
          </button>
        ))}
      </div>

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
              {message.role === 'deity' && <DeityAvatar deity={deity} size="sm" />}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'border'
                )}
                style={
                  message.role === 'deity'
                    ? { borderColor: `${config.color}40`, background: `${config.color}10` }
                    : undefined
                }
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {(isLoading || isProcessingParams) && messages[messages.length - 1]?.role !== 'deity' && (
            <div className="flex gap-3">
              <DeityAvatar deity={deity} size="sm" isSpeaking />
              <div
                className="rounded-2xl px-4 py-2 border"
                style={{ borderColor: `${config.color}40`, background: `${config.color}10` }}
              >
                <div className="flex gap-1 items-center">
                  <Sparkles className="w-4 h-4 animate-pulse" style={{ color: config.accentColor }} />
                  <span className="text-sm text-muted-foreground">
                    {isProcessingParams ? 'Adjusting parameters...' : 'Channeling wisdom...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2" style={{ borderColor: `${config.color}30` }}>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Tell ${config.name} what you need...`}
          disabled={isLoading || isProcessingParams}
          className="flex-1 bg-background/50 border-border/50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading || isProcessingParams}
          style={{ background: config.color }}
          className="hover:opacity-90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
