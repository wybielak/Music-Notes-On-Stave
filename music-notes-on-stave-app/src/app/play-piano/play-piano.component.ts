import { Component } from '@angular/core';
import { Mode } from '../melody-maker/models/Mode';

@Component({
  selector: 'app-play-piano',
  templateUrl: './play-piano.component.html',
  styleUrls: ['./play-piano.component.scss'],
})
export class PlayPianoComponent {
  protected pianoMode: Mode = Mode.PIANO;
}
