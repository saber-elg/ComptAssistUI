import { Component } from '@angular/core';
import { NbLayoutModule, NbButtonModule } from '@nebular/theme';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NbLayoutModule, 
    NbButtonModule,
    RouterModule  
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'comptassistUI';
}