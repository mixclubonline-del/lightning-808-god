import { useEffect, useState, useCallback, useRef } from 'react';
import { CosmicBackground } from './opening/CosmicBackground';
import { OlympusMountain } from './opening/OlympusMountain';
import { LightningSystem } from './opening/LightningSystem';
import { TitleReveal } from './opening/TitleReveal';
import { ProphecyDisplay } from './opening/ProphecyDisplay';
import { useDeityVoice } from '@/hooks/useDeityVoice';
import { mythSounds } from '@/utils/mythologicalSounds';
import { supabase } from '@/integrations/supabase/client';

type AnimationStage = 
  | 'cosmos' 
  | 'olympus' 
  | 'lightning' 
  | 'title' 
  | 'prophecy' 
  | 'transition' 
  | 'complete';

interface EpicOpeningAnimationProps {
  onComplete: () => void;
}

export const EpicOpeningAnimation = ({ onComplete }: EpicOpeningAnimationProps) => {
  const [stage, setStage] = useState<AnimationStage>('cosmos');
  const [prophecy, setProphecy] = useState('');
  const [canSkip, setCanSkip] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const hasPlayedThunder = useRef(false);
  const hasPlayedChoir = useRef(false);
  const hasSpoken = useRef(false);
  const stopDroneRef = useRef<(() => void) | null>(null);
  const stopChoirRef = useRef<(() => void) | null>(null);
  
  const { speak, stop, isSpeaking, audioData } = useDeityVoice('zeus');

  // Fetch AI prophecy
  useEffect(() => {
    const fetchProphecy = async () => {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
      
      try {
        const { data, error } = await supabase.functions.invoke('opening-prophecy', {
          body: { timeOfDay, deity: 'zeus' },
        });

        if (error) throw error;
        setProphecy(data.prophecy);
      } catch (error) {
        console.error('Failed to fetch prophecy:', error);
        setProphecy('The gates of Olympus open before you, mortal. Great sounds await in the divine forge.');
      }
    };

    fetchProphecy();
  }, []);

  // Animation timeline
  useEffect(() => {
    if (isSkipping) return;

    const timers: NodeJS.Timeout[] = [];

    // Stage 1: Cosmos (0-2s)
    timers.push(setTimeout(() => setStage('olympus'), 2000));

    // Stage 2: Olympus rises (2-4s)
    timers.push(setTimeout(() => setStage('lightning'), 4000));

    // Stage 3: Lightning (4-6s)
    timers.push(setTimeout(() => setStage('title'), 6000));

    // Stage 4: Title reveal (6-9s)
    timers.push(setTimeout(() => setStage('prophecy'), 9000));

    // Stage 5: Prophecy (9-13s)
    timers.push(setTimeout(() => setStage('transition'), 13000));

    // Stage 6: Transition to app (13-14s)
    timers.push(setTimeout(() => {
      setStage('complete');
      setTimeout(onComplete, 500);
    }, 14000));

    // Enable skip after 1.5s
    timers.push(setTimeout(() => setCanSkip(true), 1500));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onComplete, isSkipping]);

  // Start cosmic drone on mount, stop on transition
  useEffect(() => {
    // Start drone immediately
    stopDroneRef.current = mythSounds.playCosmicDrone();

    return () => {
      // Cleanup drone on unmount
      if (stopDroneRef.current) {
        stopDroneRef.current();
      }
    };
  }, []);

  // Stop drone when transitioning out
  useEffect(() => {
    if (stage === 'transition' || stage === 'complete' || isSkipping) {
      if (stopDroneRef.current) {
        stopDroneRef.current();
        stopDroneRef.current = null;
      }
    }
  }, [stage, isSkipping]);

  // Play thunder sound when lightning starts
  useEffect(() => {
    if (stage === 'lightning' && !hasPlayedThunder.current) {
      hasPlayedThunder.current = true;
      mythSounds.playThunderRumble();
      mythSounds.playZeusClick();
    }
  }, [stage]);

  // Play celestial choir when title is revealed
  useEffect(() => {
    if (stage === 'title' && !hasPlayedChoir.current) {
      hasPlayedChoir.current = true;
      stopChoirRef.current = mythSounds.playCelestialChoir();
    }
    
    // Stop choir when transitioning out
    if ((stage === 'transition' || stage === 'complete' || isSkipping) && stopChoirRef.current) {
      stopChoirRef.current();
      stopChoirRef.current = null;
    }
  }, [stage, isSkipping]);

  // Speak prophecy when reaching prophecy stage
  useEffect(() => {
    if (stage === 'prophecy' && prophecy && !hasSpoken.current) {
      hasSpoken.current = true;
      // Short greeting that Zeus speaks
      const zeusGreeting = "Welcome to Olympus, mortal. The divine forge awaits your creation.";
      speak(zeusGreeting);
    }
  }, [stage, prophecy, speak]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (!canSkip || isSkipping) return;
    setIsSkipping(true);
    stop();
    setStage('complete');
    setTimeout(onComplete, 300);
  }, [canSkip, isSkipping, stop, onComplete]);

  // Skip on keypress or click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  const handleLightningStrike = useCallback(() => {
    mythSounds.playZeusClick();
  }, []);

  // Calculate intensity based on stage
  const getCosmicIntensity = () => {
    switch (stage) {
      case 'cosmos': return 0.6;
      case 'olympus': return 0.8;
      case 'lightning': return 1;
      case 'title': return 0.9;
      case 'prophecy': return 0.7;
      case 'transition': return 0.3;
      case 'complete': return 0;
      default: return 0.5;
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black overflow-hidden transition-opacity duration-1000 ${
        stage === 'complete' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleSkip}
    >
      {/* Cosmic starfield background */}
      <CosmicBackground 
        intensity={getCosmicIntensity()} 
      />

      {/* Mount Olympus */}
      <OlympusMountain
        isVisible={stage !== 'cosmos'}
        showColumns={['lightning', 'title', 'prophecy', 'transition'].includes(stage)}
        showGods={['title', 'prophecy', 'transition'].includes(stage)}
      />

      {/* Lightning system */}
      <LightningSystem
        isActive={stage === 'lightning'}
        intensity={0.8}
        onStrike={handleLightningStrike}
      />

      {/* Title reveal */}
      <TitleReveal
        isVisible={['title', 'prophecy', 'transition'].includes(stage)}
        audioData={audioData}
        isSpeaking={isSpeaking}
      />

      {/* Prophecy display */}
      <ProphecyDisplay
        prophecy={prophecy}
        isVisible={stage === 'prophecy'}
        audioData={audioData}
        isSpeaking={isSpeaking}
      />

      {/* Skip hint */}
      {canSkip && !isSkipping && stage !== 'complete' && (
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground/50 tracking-widest uppercase"
          style={{
            animation: 'fade-in 0.5s ease-out',
          }}
        >
          Press any key to skip
        </div>
      )}

      {/* Screen flash overlay for lightning */}
      {stage === 'lightning' && (
        <div 
          className="absolute inset-0 bg-primary/20 pointer-events-none z-50"
          style={{
            animation: 'flash-fade 0.3s ease-out forwards',
          }}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes flash-fade {
          0% { opacity: 0.4; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
