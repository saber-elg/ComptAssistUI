import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  NbSpinnerModule
} from '@nebular/theme';

// Components
import { LoginComponent } from './login/login.component';

// Routes (adjust according to your routing structure)
const routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent
      }
      // Add other auth routes like register, forgot-password, etc.
    ]
  }
];

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),

    // Nebular modules
    NbAlertModule,
    NbButtonModule,
    NbCheckboxModule,
    NbInputModule,
    NbIconModule,
    NbFormFieldModule,
    NbLayoutModule,
    NbCardModule,
    NbSpinnerModule
  ],
  providers: [
    // Add your authentication service here
    // AuthService
  ]
})
export class AuthModule { }