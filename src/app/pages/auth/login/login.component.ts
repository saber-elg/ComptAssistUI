import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { Subject, takeUntil, from } from 'rxjs';

// Import your authentication service
// import { AuthService } from '../../../services/auth.service';

interface LoginResponse {
    token: string;
    user: {
        email: string;
        name: string;
    };
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    loginForm: FormGroup;
    isLoading = false;
    showPassword = false;
    loginError: string | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private toastrService: NbToastrService
        // private authService: AuthService // Uncomment when you have auth service
    ) {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    ngOnInit(): void {
        // Check if user is already logged in
        // if (this.authService.isAuthenticated()) {
        //   this.router.navigate(['/dashboard']);
        // }

        // Load remember me preference
        const rememberMe = localStorage.getItem('rememberMe');
        if (rememberMe === 'true') {
            this.loginForm.patchValue({ rememberMe: true });

            // Optionally load saved email
            const savedEmail = localStorage.getItem('savedEmail');
            if (savedEmail) {
                this.loginForm.patchValue({ email: savedEmail });
            }
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.isLoading = true;
        this.loginError = null;

        const { email, password, rememberMe } = this.loginForm.value;

        // Convert Promise to Observable and simulate API call
        from(this.simulateLogin(email, password))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: LoginResponse) => {
                    // Handle remember me
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                        localStorage.setItem('savedEmail', email);
                    } else {
                        localStorage.removeItem('rememberMe');
                        localStorage.removeItem('savedEmail');
                    }

                    // Show success message
                    this.toastrService.success('Connexion réussie !', 'Succès');

                    // Navigate to dashboard
                    this.router.navigate(['/dashboard']).then(() => {
                        // Navigation completed successfully
                    }).catch((navigationError) => {
                        console.error('Navigation error:', navigationError);
                    });
                },
                error: (error: Error) => {
                    this.loginError = error.message || 'Une erreur est survenue lors de la connexion';
                    this.toastrService.danger(this.loginError, 'Erreur');
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                }
            });

        // Real implementation would look like this:
        /*
        this.authService.login(email, password)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: LoginResponse) => {
              if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('savedEmail', email);
              } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('savedEmail');
              }

              this.toastrService.success('Connexion réussie !', 'Succès');
              this.router.navigate(['/dashboard']);
            },
            error: (error: Error) => {
              this.loginError = error.message || 'Identifiants incorrects';
              this.toastrService.danger(this.loginError, 'Erreur');
              this.isLoading = false;
            }
          });
        */
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    getFieldStatus(fieldName: string): NbComponentStatus {
        const field = this.loginForm.get(fieldName);
        if (field && field.touched) {
            return field.invalid ? 'danger' : 'success';
        }
        return 'basic';
    }

    private markFormGroupTouched(): void {
        Object.keys(this.loginForm.controls).forEach(key => {
            this.loginForm.get(key)?.markAsTouched();
        });
    }

    // Simulate login - Remove this in production
    private simulateLogin(email: string, password: string): Promise<LoginResponse> {
        return new Promise<LoginResponse>((resolve, reject) => {
            setTimeout(() => {
                if (email === 'admin@example.com' && password === 'password123') {
                    resolve({
                        token: 'fake-jwt-token',
                        user: { email, name: 'Admin User' }
                    });
                } else {
                    reject(new Error('Identifiants incorrects. Veuillez réessayer.'));
                }
            }, 1500);
        });
    }
}