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
import { MovingNote } from './models/MovingNote';
import { Mouse } from './models/Mouse';
import { Mode, NoteMode } from './models/Mode';

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
  onMouseDown(event: MouseEvent) {
    const staffCenterY = this.context.canvas.height / 2;
    const validMinY = staffCenterY - 5 * this.spacing;
    const validMaxY = staffCenterY + 5 * this.spacing;

    if (event.y >= validMinY && event.y <= validMaxY) {
      this.mouse.isDown = true;
      this.movingNotes.push(
        new MovingNote(
          Mode.DRAG_AND_PLAY,
          this.noteMode,
          this.spacing,
          this.drawingService,
          undefined,
          undefined,
          {
            x: this.marginRight,
            y: event.y,
          },
        ),
      );
    }
  }
  @HostListener('window:resize', ['$event'])
  fitToScreen() {
    this.context.canvas.width = window.innerWidth;
    this.context.canvas.height = window.innerHeight * 0.7;

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

  protected noteMode: NoteMode = NoteMode.FULL;
  protected speed: number = 0.005;
  protected spacing: number = 0;
  protected marginRight: number = 0;
  protected marginLeft: number = 0;

  constructor(private drawingService: DrawingService) {
    this.clefImage.src = '../../assets/images/treble-clef.png';

    this.animate = this.animate.bind(this);
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
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

    this.drawingService.drawNote(
      this.context,
      this.location,
      this.spacing,
      this.noteMode,
    );

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

  playTune(index: number) {
    const movingNote = new MovingNote(
      Mode.PIANO,
      this.noteMode,
      this.spacing,
      this.drawingService,
      index,
      this.marginRight,
    );

    this.movingNotes.push(movingNote);
  }

  handleSpeed(speed: number) {
    this.speed = speed;
  }

  changeNoteMode(mode: number) {
    switch (mode) {
      case 1:
        this.noteMode = NoteMode.FULL;
        break;
      case 2:
        this.noteMode = NoteMode.HALF;
        break;
      case 3:
        this.noteMode = NoteMode.QUARTER;
        break;
      case 4:
        this.noteMode = NoteMode.EIGHT;
        break;
    }
  }
}
