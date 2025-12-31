import { useState, useCallback, useRef, useEffect } from 'react';
import { DeityName } from '@/types/deity';

interface UseDeityVoiceReturn {
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  audioData: Uint8Array | null;
  speak: (text: string) => Promise<void>;
  stop: () => void;
}

export function useDeityVoice(deity: DeityName): UseDeityVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Voice request failed: ${response.status}`);
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
