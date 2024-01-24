import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MelodyMakerComponent } from './melody-maker/melody-maker.component';
import { MainComponent } from './main/main.component';
import { PlayPianoComponent } from './play-piano/play-piano.component';
import { DragAndPlayComponent } from './drag-and-play/drag-and-play.component';

const routes: Routes = [
  { path: 'melody-maker', component: MelodyMakerComponent },
  { path: 'drag_and_play', component: DragAndPlayComponent },
  { path: 'piano', component: PlayPianoComponent },
  { path: '', component: MainComponent },
  { path: '**', component: MainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
