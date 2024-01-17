import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MelodyMakerComponent } from './melody-maker/melody-maker.component';
import { DescriptionComponent } from './description/description.component';
import { MainComponent } from './main/main.component';
import { PianoComponent } from './piano/piano.component';

const routes: Routes = [
  { path: 'melody-maker', component: MelodyMakerComponent },
  { path: 'description', component: DescriptionComponent },
  { path: 'piano', component: PianoComponent },
  { path: '', component: MainComponent },
  { path: '**', component: MainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
