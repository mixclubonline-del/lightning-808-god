// Chord intervals in semitones
const chordIntervals: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
};

export const generateChord = (
  rootNote: number,
  chordType: string,
  inversion: number,
  spread: number
): number[] => {
  const intervals = chordIntervals[chordType] || chordIntervals.major;
  let notes = intervals.map((interval) => rootNote + interval);

  // Apply inversion
  for (let i = 0; i < inversion && i < notes.length; i++) {
    notes[i] += 12; // Move lowest note up an octave
  }

  // Sort notes
  notes.sort((a, b) => a - b);

  // Apply spread (voicing width)
  if (spread > 0 && notes.length > 1) {
    const spreadFactor = spread / 100;
    const middleIndex = Math.floor(notes.length / 2);

    notes = notes.map((note, index) => {
      if (index === 0) return note; // Keep root
      const distance = index - middleIndex;
      const spreadAmount = Math.floor(distance * spreadFactor * 12);
      return note + spreadAmount;
    });
  }

  return notes;
};

export const calculateStrumDelay = (
  noteIndex: number,
  totalNotes: number,
  strumAmount: number
): number => {
  if (strumAmount === 0) return 0;
  // Strum creates a delay between notes (0-50ms per note based on strum amount)
  const maxDelay = 50 * (strumAmount / 100);
  return (noteIndex / totalNotes) * maxDelay * totalNotes;
};
