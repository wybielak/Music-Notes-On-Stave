import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MelodyMakerComponent } from './melody-maker/melody-maker.component';
import { MainComponent } from './main/main.component';
import { PianoComponent } from './piano/piano.component';
import { FormsModule } from '@angular/forms';
import { DragAndPlayComponent } from './drag-and-play/drag-and-play.component';
import { PlayPianoComponent } from './play-piano/play-piano.component';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    MelodyMakerComponent,
    MainComponent,
    PianoComponent,
    DragAndPlayComponent,
    PlayPianoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    FormsModule,
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
