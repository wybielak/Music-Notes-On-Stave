import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  public freq: number[] = [
    1318.51, 1174.66, 1046.5, 987.767, 880, 783.991, 698.456, 659.255, 587.33,
    523.251, 493.883, 436.04, 392.44, 349.228, 329.628, 293.665, 261.626,
    246.942, 220, 195.998, 174.614,
  ];

  public notes: string[] = [
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

  constructor() {}
}
