import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';
import { MovingNote } from '../melody-maker/models/MovingNote';

@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss'],
})
export class PianoComponent implements AfterViewInit {
  @Output() indexEmitter = new EventEmitter<number>();

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    this.pressedKey(event);
  }

  protected pianoKeys: NodeListOf<HTMLInputElement>;
  protected volumeSlider: HTMLInputElement;
  protected keysCheckbox: HTMLInputElement;
  protected allKeys = [];
  protected audio = undefined;
  protected keyMap: any[] = [
    { q: 16 },
    { black: '' },
    { w: 15 },
    { black: '' },
    { e: 14 },
    { r: 13 },
    { black: '' },
    { t: 12 },
    { black: '' },
    { y: 11 },
    { black: '' },
    { u: 10 },
    { i: 9 },
    { black: '' },
    { o: 8 },
    { black: '' },
    { p: 7 },
    { z: 6 },
    { black: '' },
    { x: 5 },
    { black: '' },
    { c: 4 },
    { black: '' },
    { v: 3 },
  ];

  ngAfterViewInit(): void {
    this.pianoKeys = document.querySelectorAll('.piano_keys .key');
    this.volumeSlider = document.querySelector('.volume-slider input');
    this.keysCheckbox = document.querySelector('.keys-checkbox input');
  }

  showHideKeys() {
    this.pianoKeys.forEach((key) => key.classList.toggle('hide'));
  }

  pressedKey(event: KeyboardEvent): void {
    const key = event.key;
    const keyMapping = this.keyMap.find(
      (entry) => entry.hasOwnProperty(key) && key !== 'black',
    );

    if (keyMapping) {
      const dataKey = keyMapping[key];
      this.indexEmitter.emit(dataKey);
    }
  }
}
