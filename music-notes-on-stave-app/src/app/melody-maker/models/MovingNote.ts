import { DrawingService } from '../services/drawing.service';
import { Location } from './Location';
import { Mode } from './Mode';

export class MovingNote {
  protected audioContext: AudioContext;
  protected frequency: number = 0;
  protected freq: number[] = [
    1318.51, 1174.66, 1046.5, 987.767, 880, 783.991, 698.456, 659.255, 587.33,
    523.251, 493.883, 436.04, 392.44, 349.228, 329.628, 293.665, 261.626,
    246.942, 220, 195.998, 174.614,
  ];
  protected note: string = '';
  protected notes: string[] = [
    'E6',
    'D6',
    'C6',
    'B5',
    'A5',
    'G5',
    'F5',
    'E5',
    'D5',
    'C5',
    'B4',
    'A4',
    'G4',
    'F4',
    'E4',
    'D4',
    'C4',
    'B3',
    'A3',
    'G3',
    'F3',
  ];

  constructor(
    private mode: Mode,
    private spacing: number,
    private drawingService: DrawingService,
    private index?: number,
    private x?: number,
    public location?: Location,
  ) {
    console.log(mode);
    switch (mode) {
      case Mode.DRAG_AND_PLAY:
        console.log(location);
        const _index = Math.round((this.location.y / this.spacing) * 2);
        this.frequency =
          this.freq[_index - Math.round(this.notes.length / 2) + 1];
        this.note = this.notes[_index - Math.round(this.notes.length / 2) + 1];
        this.location.y = _index * this.spacing * 0.5;
        break;

      case Mode.PIANO:
        index = index + Math.round(this.notes.length / 2) - 1;
        this.frequency =
          this.freq[index - Math.round(this.notes.length / 2) + 1];
        this.note = this.notes[index - Math.round(this.notes.length / 2) + 1];
        this.location = {
          x: x,
          y: index * this.spacing * 0.5,
        };
        break;
      // this.value = value;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawingService.drawNote(ctx, this.location, this.spacing);
  }

  play() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    const duration = 1;
    const oscylator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.4,
      this.audioContext.currentTime + 0.05,
    );
    gainNode.gain.linearRampToValueAtTime(
      0,
      this.audioContext.currentTime + duration,
    );

    oscylator.type = 'triangle';
    oscylator.frequency.value = this.frequency;
    oscylator.start(this.audioContext.currentTime);
    oscylator.stop(this.audioContext.currentTime + duration);
    oscylator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
  }
}
