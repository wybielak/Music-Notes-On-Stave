import { Component } from '@angular/core';
import { Mode } from '../melody-maker/models/Mode';

@Component({
  selector: 'app-drag-and-play',
  templateUrl: './drag-and-play.component.html',
  styleUrls: ['./drag-and-play.component.scss'],
})
export class DragAndPlayComponent {
  protected dragAndPlayMode: Mode = Mode.DRAG_AND_PLAY;
}
