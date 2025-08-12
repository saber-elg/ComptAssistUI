import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router'; // Add Routes import

// Nebular imports
import {
  NbAlertModule,
  NbButtonModule,
  NbCheckboxModule,
  NbInputModule,
  NbIconModule,
  NbFormFieldModule,
  NbLayoutModule,
  NbCardModule,
  NbSpinnerModule,
  NbToastrModule
} from '@nebular/theme';

// Import standalone components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// Add proper typing to routes
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  }
];

@NgModule({
  declarations: [
    // Empty - standalone components don't go here
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // Import standalone components here
    LoginComponent,
    RegisterComponent,

    // Nebular modules
    NbAlertModule,
    NbButtonModule,
    NbCheckboxModule,
    NbInputModule,
    NbIconModule,
    NbFormFieldModule,
    NbLayoutModule,
    NbCardModule,
    NbSpinnerModule,
    NbToastrModule
  ],
  providers: []
})
export class AuthModule { }