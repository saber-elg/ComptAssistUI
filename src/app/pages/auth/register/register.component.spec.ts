import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NbThemeModule, NbToastrService } from '@nebular/theme';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockToastrService: jasmine.SpyObj<NbToastrService>;

    beforeEach(async () => {
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const toastrSpy = jasmine.createSpyObj('NbToastrService', ['success', 'danger']);

        await TestBed.configureTestingModule({
            declarations: [RegisterComponent],
            imports: [
                ReactiveFormsModule,
                NbThemeModule.forRoot()
            ],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: NbToastrService, useValue: toastrSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        mockToastrService = TestBed.inject(NbToastrService) as jasmine.SpyObj<NbToastrService>;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Validation', () => {
        it('should initialize with invalid form', () => {
            expect(component.registerForm.valid).toBeFalsy();
        });

        it('should validate company name', () => {
            const companyNameControl = component.registerForm.get('companyName');

            // Required validation
            expect(companyNameControl?.hasError('required')).toBeTruthy();

            // Min length validation
            companyNameControl?.setValue('A');
            expect(companyNameControl?.hasError('minlength')).toBeTruthy();

            // Valid value
            companyNameControl?.setValue('Test Company');
            expect(companyNameControl?.valid).toBeTruthy();
        });

        it('should validate legal representative', () => {
            const legalRepControl = component.registerForm.get('legalRepresentative');

            // Required validation
            expect(legalRepControl?.hasError('required')).toBeTruthy();

            // Min length validation
            legalRepControl?.setValue('A');
            expect(legalRepControl?.hasError('minlength')).toBeTruthy();

            // Valid value
            legalRepControl?.setValue('John Doe');
            expect(legalRepControl?.valid).toBeTruthy();
        });

        it('should validate phone number', () => {
            const phoneControl = component.registerForm.get('phone');

            // Required validation
            expect(phoneControl?.hasError('required')).toBeTruthy();

            // Pattern validation - invalid format
            phoneControl?.setValue('123');
            expect(phoneControl?.hasError('pattern')).toBeTruthy();

            phoneControl?.setValue('invalid-phone');
            expect(phoneControl?.hasError('pattern')).toBeTruthy();

            // Valid formats
            phoneControl?.setValue('0123456789');
            expect(phoneControl?.valid).toBeTruthy();

            phoneControl?.setValue('+33123456789');
            expect(phoneControl?.valid).toBeTruthy();
        });

        it('should validate email', () => {
            const emailControl = component.registerForm.get('email');

            // Required validation
            expect(emailControl?.hasError('required')).toBeTruthy();

            // Email format validation
            emailControl?.setValue('invalid-email');
            expect(emailControl?.hasError('email')).toBeTruthy();

            // Valid email
            emailControl?.setValue('test@example.com');
            expect(emailControl?.valid).toBeTruthy();
        });

        it('should validate password strength', () => {
            const passwordControl = component.registerForm.get('password');

            // Required validation
            expect(passwordControl?.hasError('required')).toBeTruthy();

            // Min length validation
            passwordControl?.setValue('123');
            expect(passwordControl?.hasError('minlength')).toBeTruthy();

            // Pattern validation - weak password
            passwordControl?.setValue('weakpassword');
            expect(passwordControl?.hasError('pattern')).toBeTruthy();

            // Strong password
            passwordControl?.setValue('StrongPassword123');
            expect(passwordControl?.valid).toBeTruthy();
        });

        it('should validate password confirmation', () => {
            const passwordControl = component.registerForm.get('password');
            const confirmPasswordControl = component.registerForm.get('confirmPassword');

            passwordControl?.setValue('StrongPassword123');
            confirmPasswordControl?.setValue('DifferentPassword123');

            component.registerForm.updateValueAndValidity();

            expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeTruthy();

            // Matching passwords
            confirmPasswordControl?.setValue('StrongPassword123');
            component.registerForm.updateValueAndValidity();

            expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
        });

        it('should validate terms acceptance', () => {
            const termsControl = component.registerForm.get('acceptTerms');

            expect(termsControl?.hasError('required')).toBeTruthy();

            termsControl?.setValue(true);
            expect(termsControl?.valid).toBeTruthy();
        });
    });

    describe('Component Methods', () => {
        it('should toggle password visibility', () => {
            expect(component.showPassword).toBeFalsy();

            component.togglePasswordVisibility();
            expect(component.showPassword).toBeTruthy();

            component.togglePasswordVisibility();
            expect(component.showPassword).toBeFalsy();
        });

        it('should toggle confirm password visibility', () => {
            expect(component.showConfirmPassword).toBeFalsy();

            component.toggleConfirmPasswordVisibility();
            expect(component.showConfirmPassword).toBeTruthy();

            component.toggleConfirmPasswordVisibility();
            expect(component.showConfirmPassword).toBeFalsy();
        });

        it('should update password strength', () => {
            const mockEvent = {
                target: { value: 'StrongPassword123!' }
            } as any;

            component.updatePasswordStrength(mockEvent);

            expect(component.passwordStrength.show).toBeTruthy();
            expect(component.passwordStrength.percentage).toBeGreaterThan(0);
            expect(component.passwordStrength.text).toBeTruthy();
        });

        it('should get field status correctly', () => {
            const emailControl = component.registerForm.get('email');

            // Untouched field
            expect(component.getFieldStatus('email')).toBe('basic');

            // Touched invalid field
            emailControl?.markAsTouched();
            emailControl?.setValue('');
            expect(component.getFieldStatus('email')).toBe('danger');

            // Touched valid field
            emailControl?.setValue('test@example.com');
            expect(component.getFieldStatus('email')).toBe('success');
        });

        it('should mark all fields as touched when form is invalid', () => {
            spyOn(component, 'markFormGroupTouched').and.callThrough();

            component.onSubmit();

            expect(component.markFormGroupTouched).toHaveBeenCalled();
        });
    });

    describe('Form Submission', () => {
        beforeEach(() => {
            // Set up valid form data
            component.registerForm.patchValue({
                companyName: 'Test Company',
                legalRepresentative: 'John Doe',
                phone: '0123456789',
                email: 'test@example.com',
                password: 'StrongPassword123',
                confirmPassword: 'StrongPassword123',
                acceptTerms: true
            });
        });

        it('should submit form with valid data', (done) => {
            mockRouter.navigate.and.returnValue(Promise.resolve(true));

            component.onSubmit();

            expect(component.isLoading).toBeTruthy();

            // Wait for async operation to complete
            setTimeout(() => {
                expect(mockToastrService.success).toHaveBeenCalledWith('Compte créé avec succès !', 'Succès');
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login'], {
                    queryParams: { message: 'Compte créé avec succès. Veuillez vous connecter.' }
                });
                expect(component.isLoading).toBeFalsy();
                done();
            }, 2100);
        });

        it('should handle registration error', (done) => {
            // Mock existing email error
            component.registerForm.patchValue({
                email: 'existing@example.com'
            });

            component.onSubmit();

            expect(component.isLoading).toBeTruthy();

            // Wait for async operation to complete
            setTimeout(() => {
                expect(component.registerError).toBe('Cette adresse email est déjà utilisée.');
                expect(mockToastrService.danger).toHaveBeenCalledWith('Cette adresse email est déjà utilisée.', 'Erreur');
                expect(component.isLoading).toBeFalsy();
                done();
            }, 2100);
        });

        it('should handle company name validation error', (done) => {
            // Mock invalid company name
            component.registerForm.patchValue({
                companyName: 'Test Company' // Contains 'test'
            });

            component.onSubmit();

            // Wait for async operation to complete
            setTimeout(() => {
                expect(component.registerError).toBe('Nom d\'entreprise invalide.');
                expect(mockToastrService.danger).toHaveBeenCalledWith('Nom d\'entreprise invalide.', 'Erreur');
                expect(component.isLoading).toBeFalsy();
                done();
            }, 2100);
        });
    });

    describe('Password Strength', () => {
        it('should calculate password strength correctly', () => {
            const testCases = [
                { score: 0, expected: { percentage: 20, text: 'Très faible' } },
                { score: 1, expected: { percentage: 20, text: 'Très faible' } },
                { score: 2, expected: { percentage: 40, text: 'Faible' } },
                { score: 3, expected: { percentage: 60, text: 'Moyen' } },
                { score: 4, expected: { percentage: 80, text: 'Fort' } },
                { score: 5, expected: { percentage: 100, text: 'Très fort' } }
            ];

            testCases.forEach(({ score, expected }) => {
                const result = (component as any).getPasswordStrengthConfig(score);
                expect(result.percentage).toBe(expected.percentage);
                expect(result.text).toBe(expected.text);
            });
        });
    });

    describe('Custom Validators', () => {
        it('should validate strong password', () => {
            const validator = (component as any).strongPasswordValidator;

            // Valid strong password
            expect(validator({ value: 'StrongPassword123' } as any)).toBeNull();

            // Invalid passwords
            expect(validator({ value: 'weakpassword' } as any)).toEqual({ pattern: true });
            expect(validator({ value: 'ONLYUPPERCASE123' } as any)).toEqual({ pattern: true });
            expect(validator({ value: 'onlylowercase123' } as any)).toEqual({ pattern: true });
            expect(validator({ value: 'NoNumbers' } as any)).toEqual({ pattern: true });

            // Empty value should return null (handled by required validator)
            expect(validator({ value: '' } as any)).toBeNull();
        });
    });
});