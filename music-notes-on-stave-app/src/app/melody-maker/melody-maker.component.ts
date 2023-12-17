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

  protected speed: number = 0.005;
  protected spacing: number = 0;
  protected marginRight: number = 0;
  protected marginLeft: number = 0;

  constructor(private drawingService: DrawingService) {
    this.clefImage.src = '../../assets/images/treble-clef.png';

    this.animate = this.animate.bind(this);
  }

  ngOnInit(): void {
  }

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
