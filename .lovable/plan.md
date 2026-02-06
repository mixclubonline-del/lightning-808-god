
# Add Portal Close Whoosh Sound Effect

## Overview
Add a "portal close" whoosh sound that plays when the opening animation completes and transitions to the main app. This creates an audio bookend to the portal fanfare that plays when the realm carousel starts.

---

## Sound Design

The portal close sound will be a **reverse whoosh** effect - the opposite of opening a portal:

**Sound Characteristics:**
- Descending frequency sweep (high to low, opposite of the ascending fanfare)
- Filtered white noise burst for "air rush" texture
- Low sub-bass thump for impact and finality
- Quick attack, medium decay (~0.5-0.6s total)

**Synthesis Components:**
| Component | Purpose | Parameters |
|-----------|---------|------------|
| Descending sweep | Main whoosh movement | Sine, 2000Hz → 200Hz over 0.4s |
| Noise burst | Air texture | Bandpass filtered at 1500Hz |
| Sub-bass thump | Impact/finality | Sine, 60Hz with quick decay |
| Harmonic tail | Resonant fade | Triangle at 400Hz fading out |

---

## Implementation

### File 1: `src/utils/mythologicalSounds.ts`

Add a new method `playPortalClose()` to the `MythologicalSoundEngine` class:

```typescript
// Portal close whoosh (descending sweep + noise for final transition)
playPortalClose() {
  if (!this.audioContext || !this.masterGain) return;

  const now = this.audioContext.currentTime;

  // Volume control
  const volumeControl = this.audioContext.createGain();
  volumeControl.gain.value = this.volumes.transition * 0.6;
  volumeControl.connect(this.masterGain);

  // 1. Descending frequency sweep (main whoosh)
  const sweep = this.audioContext.createOscillator();
  sweep.type = 'sine';
  sweep.frequency.setValueAtTime(2000, now);
  sweep.frequency.exponentialRampToValueAtTime(200, now + 0.4);

  const sweepGain = this.audioContext.createGain();
  sweepGain.gain.setValueAtTime(0, now);
  sweepGain.gain.linearRampToValueAtTime(0.25, now + 0.05);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  sweep.connect(sweepGain);
  sweepGain.connect(volumeControl);
  sweep.start(now);
  sweep.stop(now + 0.5);

  // 2. Filtered noise burst (air texture)
  const noiseLength = 0.4;
  const noiseBuffer = this.audioContext.createBuffer(
    1, 
    this.audioContext.sampleRate * noiseLength, 
    this.audioContext.sampleRate
  );
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  
  const noise = this.audioContext.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseFilter = this.audioContext.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(3000, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(500, now + 0.4);
  noiseFilter.Q.value = 1;

  const noiseGain = this.audioContext.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.03);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(volumeControl);
  noise.start(now);
  noise.stop(now + 0.4);

  // 3. Sub-bass thump (impact)
  const sub = this.audioContext.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 60;

  const subGain = this.audioContext.createGain();
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(0.4, now + 0.02);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  sub.connect(subGain);
  subGain.connect(volumeControl);
  sub.start(now);
  sub.stop(now + 0.25);

  // 4. Harmonic tail (resonant fade)
  const tail = this.audioContext.createOscillator();
  tail.type = 'triangle';
  tail.frequency.value = 400;
  tail.frequency.exponentialRampToValueAtTime(150, now + 0.6);

  const tailGain = this.audioContext.createGain();
  tailGain.gain.setValueAtTime(0, now + 0.1);
  tailGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
  tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  tail.connect(tailGain);
  tailGain.connect(volumeControl);
  tail.start(now);
  tail.stop(now + 0.6);
}
```

**Location:** Insert after the `playCelestialChoir()` method (around line 629), before `playThunderRumble()`.

---

### File 2: `src/components/EpicOpeningAnimation.tsx`

Add a ref to track if the portal close sound has played, and trigger it when stage becomes `'complete'`:

1. **Add ref** (near line 34):
```typescript
const hasPlayedPortalClose = useRef(false);
```

2. **Add useEffect** to play sound when stage becomes `'complete'`:
```typescript
// Play portal close sound when animation completes
useEffect(() => {
  if (stage === 'complete' && !hasPlayedPortalClose.current) {
    hasPlayedPortalClose.current = true;
    mythSounds.playPortalClose();
  }
}, [stage]);
```

3. **Also trigger on skip** - modify the `handleSkip` callback to play the sound:
```typescript
const handleSkip = useCallback(() => {
  if (!canSkip || isSkipping) return;
  setIsSkipping(true);
  stop();
  mythSounds.playPortalClose(); // Add this line
  setStage('complete');
  setTimeout(onComplete, 300);
}, [canSkip, isSkipping, stop, onComplete]);
```

---

## Audio Timeline

```text
Normal flow:
13.0s  - transition stage starts (portal fanfare plays)
14.0s  - complete stage starts (portal close whoosh plays)
14.5s  - onComplete called, main app loads

Skip flow:
User presses key → portal close whoosh plays immediately → fade to main app
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/utils/mythologicalSounds.ts` | Add `playPortalClose()` method (~50 lines) |
| `src/components/EpicOpeningAnimation.tsx` | Add ref + useEffect + handleSkip modification |
