import { Injectable } from '@angular/core';
import { Location } from '../models/Location';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor() {}

  drawNote(ctx: CanvasRenderingContext2D, location: Location, spacing: number) {
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(location.x + spacing * 0.5, location.y);
    ctx.lineTo(location.x + spacing * 0.5, location.y - spacing * 0.5 * 5);
    ctx.stroke();

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

    ctx.beginPath();
    ctx.save();
    ctx.translate(location.x, location.y);
    ctx.rotate(-0.2);
    ctx.scale(1.05, 0.8);
    ctx.arc(0, 0, spacing * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
