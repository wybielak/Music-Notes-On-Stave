import { Injectable } from '@angular/core';
import { Location } from '../models/Location';
import { NoteMode } from '../models/Mode';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor() {}

  drawNote(
    ctx: CanvasRenderingContext2D,
    location: Location,
    spacing: number,
    noteMode: NoteMode,
  ) {
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    if (noteMode > 1) {
      //rysowanie linii pionowej
      ctx.beginPath();
      ctx.moveTo(location.x + spacing * 0.5, location.y);
      ctx.lineTo(location.x + spacing * 0.5, location.y - spacing * 0.5 * 5);
      ctx.stroke();
    }

    if (noteMode > 3) {
      //rysowanie chorągiewki
      ctx.beginPath();
      ctx.moveTo(location.x + spacing * 0.5, location.y - spacing * 0.5 * 5);
      ctx.bezierCurveTo(
        location.x + spacing * 0.5 * 2,
        location.y - spacing * 0.5 * 3,
        location.x + spacing * 0.5 * 2.5,
        location.y - spacing * 0.5 * 3,
        location.x + spacing * 0.5 * 2.5,
        location.y - spacing * 0.5 * 1,
      );
      ctx.bezierCurveTo(
        location.x + spacing * 0.5 * 2.5,
        location.y - spacing * 0.5 * 2.7,
        location.x + spacing * 0.5 * 2,
        location.y - spacing * 0.5 * 2.7,
        location.x + spacing * 0.5 * 1,
        location.y - spacing * 0.5 * 4.5,
      );
      ctx.fill();
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.save();
    ctx.translate(location.x, location.y);
    ctx.rotate(-0.2);
    ctx.scale(1.05, 0.8);
    ctx.arc(0, 0, spacing * 0.5, 0, Math.PI * 2);
    if (noteMode > 2) ctx.fill(); //wypełnienie kolorem
    ctx.stroke();
    ctx.restore();
  }
}
