import { useState, useCallback, useRef, useEffect } from 'react';
import { DeityName } from '@/types/deity';

interface UseDeityVoiceReturn {
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  audioData: Uint8Array | null;
  ssmlEnabled: boolean;
  setSsmlEnabled: (enabled: boolean) => void;
  speak: (text: string) => Promise<void>;
  stop: () => void;
}

/**
 * Parse pseudo-SSML / markdown markers into a queue of speech segments.
 * Supported:
 *   <break time="500ms"/> or <break/>      -> silence pause
 *   ...                                     -> 400ms pause
 *   <emphasis>word</emphasis> or **word**   -> louder, slower
 *   <prosody rate="slow|fast" pitch="high|low">x</prosody>
 */
type Segment =
  | { type: 'speak'; text: string; rate?: number; pitch?: number; volume?: number }
  | { type: 'pause'; ms: number };

function parseSSML(input: string): Segment[] {
  const segments: Segment[] = [];
  let text = input.replace(/\.{3,}/g, '<break time="400ms"/>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<emphasis>$1</emphasis>');

  const tokenRegex = /<break(?:\s+time="(\d+)ms")?\s*\/?>|<emphasis>(.*?)<\/emphasis>|<prosody([^>]*)>(.*?)<\/prosody>/gs;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index).trim();
      if (plain) segments.push({ type: 'speak', text: plain });
    }
    if (match[0].startsWith('<break')) {
      segments.push({ type: 'pause', ms: match[1] ? parseInt(match[1], 10) : 300 });
    } else if (match[0].startsWith('<emphasis')) {
      segments.push({ type: 'speak', text: match[2].trim(), rate: 0.85, pitch: 1.1, volume: 1 });
    } else if (match[0].startsWith('<prosody')) {
      const attrs = match[3];
      const rateAttr = /rate="([^"]+)"/.exec(attrs)?.[1];
      const pitchAttr = /pitch="([^"]+)"/.exec(attrs)?.[1];
      const rate = rateAttr === 'slow' ? 0.8 : rateAttr === 'fast' ? 1.2 : parseFloat(rateAttr || '1');
      const pitch = pitchAttr === 'high' ? 1.3 : pitchAttr === 'low' ? 0.7 : parseFloat(pitchAttr || '1');
      segments.push({ type: 'speak', text: match[4].trim(), rate, pitch });
    }
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex).trim();
    if (tail) segments.push({ type: 'speak', text: tail });
  }
  return segments.length ? segments : [{ type: 'speak', text: input }];
}

function stripSSML(input: string): string {
  return input
    .replace(/<break[^>]*\/?>/g, ' ')
    .replace(/<\/?(emphasis|prosody)[^>]*>/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1');
}

export function useDeityVoice(deity: DeityName): UseDeityVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [ssmlEnabled, setSsmlEnabled] = useState(true);
  const ssmlEnabledRef = useRef(ssmlEnabled);
  useEffect(() => {
    ssmlEnabledRef.current = ssmlEnabled;
  }, [ssmlEnabled]);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateAudioData = useCallback(() => {
    if (!analyserRef.current || !isSpeaking) {
      setAudioData(null);
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setAudioData(new Uint8Array(dataArray));

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, [isSpeaking]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setAudioData(null);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any current playback
    stop();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deity-voice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, deity }),
        }
      );

      const contentType = response.headers.get('content-type') || '';

      // If JSON came back, it's either an error or a fallback signal
      if (contentType.includes('application/json')) {
        const data = await response.json().catch(() => ({}));
        if (data.fallback && 'speechSynthesis' in window) {
          console.warn('ElevenLabs unavailable, using browser speech synthesis fallback');
          const basePitch = deity === 'zeus' ? 0.7 : deity === 'apollo' ? 1.1 : 1.0;
          const baseRate = 0.95;

          const segments = ssmlEnabledRef.current
            ? parseSSML(text)
            : [{ type: 'speak' as const, text: stripSSML(text) }];

          const playQueue = (i: number) => {
            if (i >= segments.length) {
              setIsSpeaking(false);
              setAudioData(null);
              return;
            }
            const seg = segments[i];
            if (seg.type === 'pause') {
              pauseTimerRef.current = setTimeout(() => playQueue(i + 1), seg.ms);
              return;
            }
            const u = new SpeechSynthesisUtterance(seg.text);
            u.rate = baseRate * (seg.rate ?? 1);
            u.pitch = basePitch * (seg.pitch ?? 1);
            u.volume = seg.volume ?? 1;
            if (i === 0) u.onstart = () => setIsSpeaking(true);
            u.onend = () => playQueue(i + 1);
            u.onerror = () => {
              setIsSpeaking(false);
              setAudioData(null);
            };
            window.speechSynthesis.speak(u);
          };
          setIsSpeaking(true);
          playQueue(0);
          return;
        }
        throw new Error(data.error || `Voice request failed: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(`Voice request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;

      // Set up Web Audio API for visualization
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Resume context if suspended (autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Create analyser if not exists
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        analyserRef.current.smoothingTimeConstant = 0.8;
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      // Create source for this audio element
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);

      audio.onplay = () => {
        setIsSpeaking(true);
        // Start the animation loop
        const animate = () => {
          if (!analyserRef.current) return;
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          setAudioData(new Uint8Array(dataArray));
          
          if (audioRef.current && !audioRef.current.paused) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };
        animate();
      };
      
      audio.onended = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setIsSpeaking(false);
        setAudioData(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setError('Failed to play audio');
        setIsSpeaking(false);
        setAudioData(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('Voice synthesis error:', err);
      setError(err instanceof Error ? err.message : 'Voice synthesis failed');
    } finally {
      setIsLoading(false);
    }
  }, [deity, stop]);

  return {
    isSpeaking,
    isLoading,
    error,
    audioData,
    speak,
    stop,
  };
}
