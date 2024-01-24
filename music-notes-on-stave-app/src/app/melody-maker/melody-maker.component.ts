import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DrawingService } from './services/drawing.service';
import { Location } from './models/Location';
import { MovingNote } from './models/MovingNote';
import { Mouse } from './models/Mouse';
import { Mode, NoteMode, Song } from './models/Mode';
import { NotesService } from './services/notes.service';
import { BehaviorSubject } from 'rxjs';
import { Recording } from './models/Recording';

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
    if (this.mode === Mode.DRAG_AND_PLAY && !this.playingMode) {
      const staffCenterY = this.context.canvas.height / 2;
      const validMinY = staffCenterY - 5 * this.spacing;
      const validMaxY = staffCenterY + 5 * this.spacing;
      const movingNote = new MovingNote(
        Mode.DRAG_AND_PLAY,
        this.noteMode,
        this.spacing,
        this.drawingService,
        this.notesService,
        undefined,
        undefined,
        {
          x: this.marginRight,
          y: event.y,
        },
      );

      if (event.y >= validMinY && event.y <= validMaxY) {
        this.mouse.isDown = true;
        this.movingNotes.push(movingNote);
        if (this.recordingMode) {
          this.sum = this.recordSong(movingNote, this.sum);
        }
      }
    }
  }
  @HostListener('window:resize', ['$event'])
  fitToScreen() {
    this.context.canvas.width = window.innerWidth;
    this.context.canvas.height = window.innerHeight * 0.5;

    const canvas = this.context.canvas;
    this.spacing = canvas.height / 20;

    this.marginRight = canvas.width * 0.8;
    this.marginLeft = canvas.width * 0.2;

    this.drawScene();
  }

  @Input() mode: Mode = Mode.PIANO;

  protected dragAndPlayMode: Mode = Mode.DRAG_AND_PLAY;
  protected pianoMode: Mode = Mode.PIANO;

  protected composeMode: boolean = false;
  protected recordingMode: boolean = false;
  protected playingMode: boolean = false;

  protected context: CanvasRenderingContext2D;
  protected mouse: Mouse = new Mouse();
  protected location: Location = new Location();
  protected movingNotes: MovingNote[] = [];
  protected recording: Recording[] = [];
  protected clefImage = new Image();

  protected chosenSong: BehaviorSubject<Song> = new BehaviorSubject<Song>(
    undefined,
  );
  protected noteMode: NoteMode = NoteMode.FULL;
  protected speed: number = 0.005;
  protected spacing: number = 0;
  protected marginRight: number = 0;
  protected marginLeft: number = 0;

  protected sum: number = 0;

  constructor(
    private drawingService: DrawingService,
    private notesService: NotesService,
  ) {
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

    if (this.mode === Mode.DRAG_AND_PLAY) {
      this.drawingService.drawNote(
        this.context,
        this.location,
        this.spacing,
        this.noteMode,
      );
    }

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
      this.mode,
      this.noteMode,
      this.spacing,
      this.drawingService,
      this.notesService,
      index,
      this.marginRight,
    );

    if (this.recordingMode) {
      this.sum = this.recordSong(movingNote, this.sum);
    }

    this.movingNotes.push(movingNote);
  }

  handleSpeed(speed: number) {
    this.speed = speed;
  }

  record() {
    this.playingMode = false;
    this.recordingMode = false;
    if (this.movingNotes.length === 0) {
      this.recordingMode = true;
      while (this.recording.length > 0) this.recording.pop();
    }
  }

  save() {
    const jsonString = JSON.stringify(this.recording, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'saved_songs.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  inputFile(event: any) {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result as string);
          this.recording = jsonData;
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };

      reader.readAsText(file);
    }
  }

  playRecordedSong() {
    this.playingMode = true;
    this.recordingMode = false;
    if (this.movingNotes.length === 0) {
      for (let i = 0; i < this.recording.length; i++) {
        if (i === 0) {
          this.addAutoNote(
            this.recording[i].movingNote.note,
            this.recording[i].movingNote.noteMode,
            this.recording[i].sum,
          );
        } else {
          this.addAutoNote(
            this.recording[i].movingNote.note,
            this.recording[i].movingNote.noteMode,
            this.recording[i - 1].sum *
              this.canvas.nativeElement.width *
              this.speed *
              4,
          );
        }
      }
    }
  }

  recordSong(movingNote: MovingNote, sum: number) {
    if (this.noteMode === NoteMode.EIGHT) sum += 70;
    if (this.noteMode === NoteMode.QUARTER) sum += 45;
    if (this.noteMode === NoteMode.HALF) sum += 25;
    if (this.noteMode === NoteMode.FULL) sum += 10;

    this.recording.push({ movingNote: movingNote, sum: sum });
    return sum;
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

  setSongToBePlayed(song: number) {
    switch (song) {
      case 1:
        this.chosenSong.next(Song.HALLELUJAH);
        break;
      case 2:
        this.chosenSong.next(Song.HOUSE_OF_THE_RISING_SUN);
        break;
      case 3:
        this.chosenSong.next(Song.TIME_AFTER_TIME);
        break;
    }
  }

  playSong() {
    switch (this.chosenSong.value) {
      case Song.HALLELUJAH:
        this.hallelujah();
        break;
      case Song.HOUSE_OF_THE_RISING_SUN:
        this.houseOfTheRisingSky();
        break;
      case Song.TIME_AFTER_TIME:
        this.timeAfterTime();
        break;
    }
  }

  addAutoNote(note: string, mode: NoteMode, offset: number) {
    const index = this.notesService.notes.indexOf(note);
    const movingNote = new MovingNote(
      Mode.PIANO,
      mode,
      this.spacing,
      this.drawingService,
      this.notesService,
      index,
      this.canvas.nativeElement.width + offset,
    );
    this.movingNotes.push(movingNote);
  }

  playAutoNote(name: string) {
    switch (name) {
      case 'C':
        this.Cchord();
        break;
      case 'Dm':
        this.Dmchord();
        break;
      case 'Em':
        this.Emchord();
        break;
      case 'F':
        this.Fchord();
        break;
      case 'G':
        this.Gchord();
        break;
      case 'Am':
        this.Amchord();
        break;
      case 'Hdim':
        this.Hdimchord();
        break;
    }
  }

  Cchord() {
    this.addAutoNote('C4', this.noteMode, 0);
    this.addAutoNote('E4', this.noteMode, 0);
    this.addAutoNote('G4', this.noteMode, 0);
  }

  Dmchord() {
    this.addAutoNote('D4', this.noteMode, 0);
    this.addAutoNote('F4', this.noteMode, 0);
    this.addAutoNote('A4', this.noteMode, 0);
  }

  Emchord() {
    this.addAutoNote('E4', this.noteMode, 0);
    this.addAutoNote('G4', this.noteMode, 0);
    this.addAutoNote('B4', this.noteMode, 0);
  }

  Fchord() {
    this.addAutoNote('F4', this.noteMode, 0);
    this.addAutoNote('A4', this.noteMode, 0);
    this.addAutoNote('C4', this.noteMode, 0);
  }

  Gchord() {
    this.addAutoNote('G4', this.noteMode, 0);
    this.addAutoNote('B4', this.noteMode, 0);
    this.addAutoNote('D4', this.noteMode, 0);
  }

  Amchord() {
    this.addAutoNote('A4', this.noteMode, 0);
    this.addAutoNote('C4', this.noteMode, 0);
    this.addAutoNote('E4', this.noteMode, 0);
  }

  Hdimchord() {
    this.addAutoNote('B4', this.noteMode, 0);
    this.addAutoNote('D4', this.noteMode, 0);
    this.addAutoNote('F4', this.noteMode, 0);
  }

  hallelujah() {
    let sum = 0;
    this.addAutoNote(
      'E4',
      4,
      sum * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'G4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'E4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'G4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'A4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'F4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'G4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G4',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
  }

  houseOfTheRisingSky() {
    let sum = 0;
    this.addAutoNote(
      'G4',
      3,
      sum * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'G4',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'B4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C5',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E5',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'D5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      1,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'A5',
      4,
      (sum += 70 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A5',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A5',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G5',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E5',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E5',
      1,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'G5',
      3,
      (sum += 70 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G5',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'B4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C5',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E5',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'D5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A4',
      1,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'A5',
      4,
      (sum += 70 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A5',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'A5',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G5',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'G5',
      3,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E5',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E5',
      1,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
  }

  timeAfterTime() {
    let sum = 0;

    this.addAutoNote(
      'F4',
      2,
      sum * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'A4',
      2,
      sum * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'C4',
      2,
      sum * this.canvas.nativeElement.width * this.speed * 4,
    );

    this.addAutoNote(
      'G4',
      2,
      sum + 50 * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'B4',
      2,
      sum + 50 * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'D4',
      2,
      sum + 50 * this.canvas.nativeElement.width * this.speed * 4,
    );

    this.addAutoNote(
      'E4',
      2,
      sum + 100 * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'G4',
      2,
      sum + 100 * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'B4',
      2,
      sum + 100 * this.canvas.nativeElement.width * this.speed * 4,
    );

    this.addAutoNote(
      'F4',
      2,
      sum + 150 * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'A4',
      2,
      sum + 150 * this.canvas.nativeElement.width * this.speed * 4,
    );
    this.addAutoNote(
      'C4',
      2,
      sum + 150 * this.canvas.nativeElement.width * this.speed * 4,
    );

    sum += 2250;

    this.addAutoNote(
      'D4',
      3,
      (sum += 50 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'D4',
      3,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'D4',
      3,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'D4',
      3,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'D4',
      3,
      (sum += 60 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'D4',
      3,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'D4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'D4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      4,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'C4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );

    this.addAutoNote(
      'D4',
      3,
      (sum += 35 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E4',
      3,
      (sum += 10 * this.canvas.nativeElement.width * this.speed * 4),
    );
    this.addAutoNote(
      'E4',
      4,
      (sum += 30 * this.canvas.nativeElement.width * this.speed * 4),
    );
  }
}
