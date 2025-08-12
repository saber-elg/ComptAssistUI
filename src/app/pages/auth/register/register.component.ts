import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { Subject, takeUntil, from } from 'rxjs';

// Import your authentication service
// import { AuthService } from '../../../services/auth.service';

interface RegisterData {
    companyName: string;
    legalRepresentative: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

interface RegisterResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string;
        companyName: string;
    };
}

interface PasswordStrength {
    show: boolean;
    percentage: number;
    text: string;
    colorClass: string;
    textClass: string;
}

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    registerForm: FormGroup;
    isLoading = false;
    showPassword = false;
    showConfirmPassword = false;
    registerError: string | null = null;

    passwordStrength: PasswordStrength = {
        show: false,
        percentage: 0,
        text: '',
        colorClass: '',
        textClass: ''
    };

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private toastrService: NbToastrService
        // private authService: AuthService // Uncomment when you have auth service
    ) {
        this.registerForm = this.formBuilder.group({
            companyName: ['', [Validators.required, Validators.minLength(2)]],
            legalRepresentative: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^(?:\+33|0)[1-9](?:[0-9]{8})$/)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                this.strongPasswordValidator
            ]],
            confirmPassword: ['', [Validators.required]],
            acceptTerms: [false, [Validators.requiredTrue]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    ngOnInit(): void {
        // Check if user is already logged in
        // if (this.authService.isAuthenticated()) {
        //   this.router.navigate(['/dashboard']);
        // }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.isLoading = true;
        this.registerError = null;

        const formData: RegisterData = this.registerForm.value;

        // Convert Promise to Observable and simulate API call
        from(this.simulateRegister(formData))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: RegisterResponse) => {
                    // Show success message
                    this.toastrService.success('Compte créé avec succès !', 'Succès');

                    // Navigate to login page with success message
                    this.router.navigate(['/auth/login'], {
                        queryParams: { message: 'Compte créé avec succès. Veuillez vous connecter.' }
                    }).then(() => {
                        // Navigation completed successfully
                    }).catch((navigationError) => {
                        console.error('Navigation error:', navigationError);
                    });
                },
                error: (error: Error) => {
                    this.registerError = error.message || 'Une erreur est survenue lors de la création du compte';
                    this.toastrService.danger(this.registerError, 'Erreur');
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                }
            });

        // Real implementation would look like this:
        /*
        this.authService.register(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: RegisterResponse) => {
              this.toastrService.success('Compte créé avec succès !', 'Succès');
              this.router.navigate(['/auth/login'], {
                queryParams: { message: 'Compte créé avec succès. Veuillez vous connecter.' }
              });
            },
            error: (error: Error) => {
              this.registerError = error.message || 'Une erreur est survenue lors de la création du compte';
              this.toastrService.danger(this.registerError, 'Erreur');
              this.isLoading = false;
            }
          });
        */
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    updatePasswordStrength(event: Event): void {
        const target = event.target as HTMLInputElement;
        const password = target.value;

        if (!password) {
            this.passwordStrength.show = false;
            return;
        }

        this.passwordStrength.show = true;

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strength = this.getPasswordStrengthConfig(score);
        this.passwordStrength = { ...this.passwordStrength, ...strength };
    }

    getFieldStatus(fieldName: string): NbComponentStatus {
        const field = this.registerForm.get(fieldName);
        if (field && field.touched) {
            return field.invalid ? 'danger' : 'success';
        }
        return 'basic';
    }

    public markFormGroupTouched(): void {
        Object.keys(this.registerForm.controls).forEach(key => {
            this.registerForm.get(key)?.markAsTouched();
        });
    }

    // Custom Validators
    private strongPasswordValidator(control: AbstractControl): { [key: string]: any } | null {
        const value = control.value;
        if (!value) return null;

        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);

        if (hasUpperCase && hasLowerCase && hasNumber) {
            return null;
        }

        return { pattern: true };
    }

    private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        if (password && confirmPassword && password !== confirmPassword) {
            group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        // Clear the error if passwords match
        const confirmControl = group.get('confirmPassword');
        if (confirmControl?.errors?.['passwordMismatch']) {
            delete confirmControl.errors['passwordMismatch'];
            if (Object.keys(confirmControl.errors).length === 0) {
                confirmControl.setErrors(null);
            }
        }

        return null;
    }

    private getPasswordStrengthConfig(score: number): Partial<PasswordStrength> {
        switch (score) {
            case 0:
            case 1:
                return {
                    percentage: 20,
                    text: 'Très faible',
                    colorClass: 'strength-very-weak',
                    textClass: 'text-danger'
                };
            case 2:
                return {
                    percentage: 40,
                    text: 'Faible',
                    colorClass: 'strength-weak',
                    textClass: 'text-warning'
                };
            case 3:
                return {
                    percentage: 60,
                    text: 'Moyen',
                    colorClass: 'strength-medium',
                    textClass: 'text-info'
                };
            case 4:
                return {
                    percentage: 80,
                    text: 'Fort',
                    colorClass: 'strength-strong',
                    textClass: 'text-primary'
                };
            case 5:
                return {
                    percentage: 100,
                    text: 'Très fort',
                    colorClass: 'strength-very-strong',
                    textClass: 'text-success'
                };
            default:
                return {
                    percentage: 0,
                    text: '',
                    colorClass: '',
                    textClass: ''
                };
        }
    }

    // Simulate register - Remove this in production
    private simulateRegister(userData: RegisterData): Promise<RegisterResponse> {
        return new Promise<RegisterResponse>((resolve, reject) => {
            setTimeout(() => {
                if (userData.email === 'existing@example.com') {
                    reject(new Error('Cette adresse email est déjà utilisée.'));
                } else if (userData.companyName.toLowerCase().includes('test')) {
                    reject(new Error('Nom d\'entreprise invalide.'));
                } else {
                    console.log('User registered successfully:', userData);
                    resolve({
                        success: true,
                        message: 'Compte créé avec succès',
                        user: {
                            id: 'user-123',
                            email: userData.email,
                            companyName: userData.companyName
                        }
                    });
                }
            }, 2000);
        });
    }
}