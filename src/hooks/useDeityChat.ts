import { useState, useCallback } from 'react';
import { DeityName, DeityMessage, getRandomGreeting } from '@/types/deity';

interface UseDeityChat {
  messages: DeityMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  initializeWithGreeting: () => void;
}

export function useDeityChat(deity: DeityName, context?: Record<string, unknown>): UseDeityChat {
  const [messages, setMessages] = useState<DeityMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeWithGreeting = useCallback(() => {
    const greeting = getRandomGreeting(deity);
    setMessages([{
      role: 'deity',
      content: greeting,
      timestamp: new Date(),
      deity,
    }]);
  }, [deity]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: DeityMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    let assistantContent = '';

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'deity' && last.deity === deity) {
          return prev.map((m, i) => 
            i === prev.length - 1 
              ? { ...m, content: assistantContent } 
              : m
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

      apiMessages.push({ role: 'user', content });

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
            context,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reach the deity');
      }

      if (!response.body) {
        throw new Error('No response stream');
      }

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
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

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
    } catch (err) {
      console.error('Deity chat error:', err);
      setError(err instanceof Error ? err.message : 'Connection to deity lost');
    } finally {
      setIsLoading(false);
    }
  }, [messages, deity, context]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    initializeWithGreeting,
  };
}
