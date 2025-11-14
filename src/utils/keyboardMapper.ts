/**
 * Maps computer keyboard keys to MIDI notes
 * Using piano-style layout across two rows
 */

export interface KeyboardMapping {
  key: string;
  note: number;
  label: string;
}

// Base octave for keyboard (C4 = MIDI note 60)
const BASE_OCTAVE = 4;
const MIDDLE_C = 60;

// Piano-style keyboard layout
// Bottom row: C, D, E, F, G, A, B (white keys)
// Top row: C#, D#, F#, G#, A# (black keys)
export const keyboardMappings: KeyboardMapping[] = [
  // Octave controls
  { key: 'z', note: -1, label: 'Oct-' },
  { key: 'x', note: -2, label: 'Oct+' },
  
  // White keys (bottom row) - C major scale
  { key: 'a', note: 0, label: 'C' },   // C
  { key: 's', note: 2, label: 'D' },   // D
  { key: 'd', note: 4, label: 'E' },   // E
  { key: 'f', note: 5, label: 'F' },   // F
  { key: 'g', note: 7, label: 'G' },   // G
  { key: 'h', note: 9, label: 'A' },   // A
  { key: 'j', note: 11, label: 'B' },  // B
  { key: 'k', note: 12, label: 'C+' }, // C (next octave)
  
  // Black keys (top row) - Sharps
  { key: 'w', note: 1, label: 'C#' },  // C#
  { key: 'e', note: 3, label: 'D#' },  // D#
  { key: 't', note: 6, label: 'F#' },  // F#
  { key: 'y', note: 8, label: 'G#' },  // G#
  { key: 'u', note: 10, label: 'A#' }, // A#
];

export type KeyboardCallback = (note: number, velocity: number, isNoteOn: boolean) => void;

export class KeyboardMapper {
  private activeKeys: Set<string> = new Set();
  private callbacks: Set<KeyboardCallback> = new Set();
  private octaveOffset: number = 0;
  private isEnabled: boolean = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  disable(): void {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    
    // Release all active notes
    this.activeKeys.forEach(key => {
      const mapping = this.getMapping(key);
      if (mapping && mapping.note >= 0) {
        const midiNote = this.getMidiNote(mapping.note);
        this.notifyCallbacks(midiNote, 0, false);
      }
    });
    this.activeKeys.clear();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore if typing in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    
    // Prevent repeat events
    if (this.activeKeys.has(key)) return;

    const mapping = this.getMapping(key);
    if (!mapping) return;

    event.preventDefault();

    // Handle octave controls
    if (mapping.note === -1) {
      this.octaveOffset = Math.max(-2, this.octaveOffset - 1);
      console.log('Octave:', BASE_OCTAVE + this.octaveOffset);
      return;
    }
    if (mapping.note === -2) {
      this.octaveOffset = Math.min(2, this.octaveOffset + 1);
      console.log('Octave:', BASE_OCTAVE + this.octaveOffset);
      return;
    }

    // Play note
    this.activeKeys.add(key);
    const midiNote = this.getMidiNote(mapping.note);
    const velocity = 0.8; // Default keyboard velocity
    this.notifyCallbacks(midiNote, velocity, true);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    
    if (!this.activeKeys.has(key)) return;

    const mapping = this.getMapping(key);
    if (!mapping || mapping.note < 0) return;

    event.preventDefault();

    this.activeKeys.delete(key);
    const midiNote = this.getMidiNote(mapping.note);
    this.notifyCallbacks(midiNote, 0, false);
  }

  private getMapping(key: string): KeyboardMapping | undefined {
    return keyboardMappings.find(m => m.key === key);
  }

  private getMidiNote(offset: number): number {
    return MIDDLE_C + offset + (this.octaveOffset * 12);
  }

  private notifyCallbacks(note: number, velocity: number, isNoteOn: boolean): void {
    this.callbacks.forEach(callback => callback(note, velocity, isNoteOn));
  }

  subscribe(callback: KeyboardCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getCurrentOctave(): number {
    return BASE_OCTAVE + this.octaveOffset;
  }

  getActiveKeys(): string[] {
    return Array.from(this.activeKeys);
  }
}

// Singleton instance
export const keyboardMapper = new KeyboardMapper();
