export interface MidiMessage {
  type: 'noteon' | 'noteoff' | 'control';
  note?: number;
  velocity?: number;
  control?: number;
  value?: number;
}

export type MidiCallback = (message: MidiMessage) => void;

export class MidiHandler {
  private midiAccess: MIDIAccess | null = null;
  private callbacks: Set<MidiCallback> = new Set();
  private connectedDevices: MIDIInput[] = [];

  async initialize(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API not supported');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.setupInputs();
      this.midiAccess.onstatechange = () => this.setupInputs();
      return true;
    } catch (error) {
      console.error('Failed to initialize MIDI:', error);
      return false;
    }
  }

  private setupInputs(): void {
    if (!this.midiAccess) return;

    // Clear existing connections
    this.connectedDevices.forEach(input => {
      input.onmidimessage = null;
    });
    this.connectedDevices = [];

    // Setup new connections
    this.midiAccess.inputs.forEach(input => {
      input.onmidimessage = (event) => this.handleMidiMessage(event);
      this.connectedDevices.push(input);
      console.log('Connected MIDI device:', input.name);
    });
  }

  private handleMidiMessage(event: MIDIMessageEvent): void {
    const [status, data1, data2] = event.data;
    const command = status & 0xf0;
    
    let message: MidiMessage | null = null;

    switch (command) {
      case 0x90: // Note On
        if (data2 > 0) {
          message = {
            type: 'noteon',
            note: data1,
            velocity: data2 / 127,
          };
        } else {
          // Velocity 0 is note off
          message = {
            type: 'noteoff',
            note: data1,
            velocity: 0,
          };
        }
        break;

      case 0x80: // Note Off
        message = {
          type: 'noteoff',
          note: data1,
          velocity: data2 / 127,
        };
        break;

      case 0xb0: // Control Change
        message = {
          type: 'control',
          control: data1,
          value: data2 / 127,
        };
        break;
    }

    if (message) {
      this.callbacks.forEach(callback => callback(message));
    }
  }

  subscribe(callback: MidiCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getConnectedDevices(): string[] {
    return this.connectedDevices.map(input => input.name || 'Unknown Device');
  }

  isConnected(): boolean {
    return this.connectedDevices.length > 0;
  }

  disconnect(): void {
    this.connectedDevices.forEach(input => {
      input.onmidimessage = null;
    });
    this.connectedDevices = [];
    this.callbacks.clear();
  }
}

// Singleton instance
export const midiHandler = new MidiHandler();
