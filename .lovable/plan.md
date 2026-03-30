

# Piano Roll / Step Sequencer for Apollo Realm

## Overview
Add a piano roll and step sequencer component to the Apollo Realm for programming melodies and rhythms with note input, velocity editing, and pattern looping. Also fix 3 existing build errors (`NodeJS.Timeout` namespace).

## Build Error Fixes

Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` in three files:
- `src/components/EpicOpeningAnimation.tsx` line 65
- `src/components/HermesMeter.tsx` line 15
- `src/components/MidiKeyboardControls.tsx` line 35

## Piano Roll Component

### New file: `src/components/ApolloPianoRoll.tsx`

A grid-based piano roll with:

```text
┌─────────────────────────────────────────────────┐
│ ▶ ■ ⟳  BPM:[120]  Steps:[16▼]  Pattern: 1/4   │
├────┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬─┤
│ C5 │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │
│ B4 │  │██│  │  │  │  │  │  │  │██│  │  │  │  │ │
│ A4 │  │  │  │██│  │  │  │  │  │  │  │██│  │  │ │
│ G4 │  │  │  │  │  │  │██│  │  │  │  │  │  │  │ │
│... │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │
│ C4 │██│  │  │  │  │  │  │██│  │  │  │  │  │  │ │
├────┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴─┤
│ Velocity: [bar graph per step]                   │
└─────────────────────────────────────────────────┘
```

**Features:**
- **Grid**: 16/32-step grid × 2 octaves of note rows (C3–C5)
- **Note input**: Click cells to toggle notes on/off; colored by velocity
- **Velocity lane**: Bottom strip showing velocity bars per active note, draggable to adjust
- **Transport**: Play/Stop/Loop buttons with BPM control
- **Playback**: Uses Web Audio API scheduling via `onNoteOn`/`onNoteOff` props
- **Pattern management**: 4 pattern slots, switchable
- **Visual playhead**: Animated column highlight showing current step during playback

**Props:**
```typescript
interface ApolloPianoRollProps {
  onNoteOn: (note: number, velocity?: number) => void;
  onNoteOff: (note: number) => void;
}
```

**Internal state:**
- `notes`: `Map<string, { note: number; step: number; velocity: number }>`
- `isPlaying`, `bpm`, `currentStep`, `stepCount` (16 or 32)
- `patterns`: array of 4 pattern slots
- `activePattern`: index

**Playback engine:** `setInterval` at `(60 / bpm / 4) * 1000` ms per step. On each tick, trigger `onNoteOn` for active notes at that step, schedule `onNoteOff` after a gate time.

### Modified file: `src/components/realms/ApolloRealm.tsx`

Add the `ApolloPianoRoll` between the keyboard and envelope sections, wrapped in `data-module="apollo-sequencer"`. Update constellation connections to include the new module.

## Files Summary

| File | Action |
|------|--------|
| `src/components/EpicOpeningAnimation.tsx` | Fix `NodeJS.Timeout` → `ReturnType<typeof setTimeout>` |
| `src/components/HermesMeter.tsx` | Fix `NodeJS.Timeout` → `ReturnType<typeof setTimeout>` |
| `src/components/MidiKeyboardControls.tsx` | Fix `NodeJS.Timeout` → `ReturnType<typeof setTimeout>` |
| `src/components/ApolloPianoRoll.tsx` | Create — piano roll/step sequencer component |
| `src/components/realms/ApolloRealm.tsx` | Add piano roll to realm layout |

