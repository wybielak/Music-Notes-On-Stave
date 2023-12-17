import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DrawingService } from './services/drawing.service';
import { Location } from './models/Location';

export class Mouse {
  x: number = 0;
  y: number = 0;
  isDown: boolean = false;
}

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
  protected mainLocation: Location = new Location();

  constructor(
    public location: Location,
    private spacing: number,
    private drawingService: DrawingService,
  ) {
    const index = Math.round((this.location.y / this.spacing) * 2);
    this.frequency = this.freq[index - Math.round(this.notes.length / 2) + 1];
    this.note = this.notes[index - Math.round(this.notes.length / 2) + 1];
    this.mainLocation.x = this.location.x;
    this.mainLocation.y = index * this.spacing * 0.5;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawingService.drawNote(ctx, this.mainLocation, this.spacing);
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

@Component({
  selector: 'melody-maker',
  templateUrl: './melody-maker.component.html',
  styleUrls: ['./melody-maker.component.scss'],
})
export class MelodyMakerComponent implements OnInit, AfterViewInit {
  @ViewChild('myStaff') canvas: ElementRef<HTMLCanvasElement>;

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse.x = event.x;
    this.mouse.y = event.y;
  }
  @HostListener('window:mouseup', ['$event'])
  onMouseUp() {
    this.mouse.isDown = false;
  }
  @HostListener('window:mousedown', ['$event'])
  onMouseDown() {
    this.mouse.isDown = true;
    this.movingNotes.push(
      new MovingNote(
        { x: this.marginRight, y: this.mouse.y },
        this.spacing,
        this.drawingService,
      ),
    );
  }
  @HostListener('window:resize', ['$event'])
  fitToScreen() {
    this.context.canvas.width = window.innerWidth;
    this.context.canvas.height = window.innerHeight;

    const canvas = this.context.canvas;
    this.spacing = canvas.height / 20;

    this.marginRight = canvas.width * 0.8;
    this.marginLeft = canvas.width * 0.2;

    this.drawScene();
  }

  protected context: CanvasRenderingContext2D;
  protected mouse: Mouse = new Mouse();
  protected location: Location = new Location();
  protected movingNotes: MovingNote[] = [];
  protected clefImage = new Image();

  protected speed: number = 0.05;
  protected spacing: number = 0;
  protected marginRight: number = 0;
  protected marginLeft: number = 0;

  constructor(private drawingService: DrawingService) {
    this.clefImage.src = '../../assets/images/treble-clef.png';

    this.animate = this.animate.bind(this);
  }

  ngOnInit(): void {
    console.log(this.canvas);
  }

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    console.log(this.context.canvas);
    this.fitToScreen();
    this.animate();
  }

  drawScene() {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height,
    );

    this.context.strokeStyle = 'black';
    this.context.lineWidth = 1;

    for (let i = -2; i <= 2; i++) {
      const y = this.context.canvas.height / 2 + i * this.spacing;

      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(this.context.canvas.width, y);
      this.context.stroke();
    }

    const index = Math.round((this.mouse.y / this.spacing) * 2);

    this.location.x = this.marginRight;
    this.location.y = index * this.spacing * 0.5;

    this.drawingService.drawNote(this.context, this.location, this.spacing);

    for (let i = 0; i < this.movingNotes.length; i++) {
      this.movingNotes[i].draw(this.context);
    }

    this.drawClef(this.context, {
      x: this.marginLeft,
      y: this.context.canvas.height * 0.5,
    });
  }

  drawClef(ctx: CanvasRenderingContext2D, location: Location) {
    const aspectRatio = this.clefImage.width / this.clefImage.height;
    const newHeight = this.context.canvas.height * 0.45;
    const newWidth = aspectRatio * newHeight;

    ctx.drawImage(
      this.clefImage,
      location.x - newWidth / 2,
      location.y - newHeight / 2,
      newWidth,
      newHeight,
    );
  }

  animate() {
    this.updateMovingNotes();
    this.drawScene();
    window.requestAnimationFrame(this.animate);
  }

  updateMovingNotes() {
    for (let i = 0; i < this.movingNotes.length; i++) {
      this.movingNotes[i].location.x -= this.speed * this.context.canvas.width;
      if (this.movingNotes[i].location.x <= this.marginLeft) {
        this.movingNotes[i].play();
        this.movingNotes.splice(i, 1);
        i--;
      }
    }
  }
}
