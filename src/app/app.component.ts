import { Component } from '@angular/core';
import { NbLayoutModule, NbButtonModule,NbCardModule, NbInputModule, NbIconModule, NbCheckboxModule, NbAlertModule } from '@nebular/theme';
import { RouterModule } from '@angular/router';
// Add these imports to your module
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