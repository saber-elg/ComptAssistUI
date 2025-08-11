import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NbThemeModule, NbToastrService, NbLayoutModule } from '@nebular/theme';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';

// Mock services
const mockRouter = {
    navigate: jasmine.createSpy('navigate')
};

const mockToastrService = {
    success: jasmine.createSpy('success'),
    danger: jasmine.createSpy('danger')
};

// Mock AuthService - uncomment when you have it
/*
const mockAuthService = {
  login: jasmine.createSpy('login'),
  isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false)
};
*/

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LoginComponent],
            imports: [
                ReactiveFormsModule,
                NbThemeModule.forRoot(),
                NbLayoutModule
            ],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: NbToastrService, useValue: mockToastrService }
                // { provide: AuthService, useValue: mockAuthService } // Uncomment when you have auth service
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        // Reset spies
        mockRouter.navigate.calls.reset();
        mockToastrService.success.calls.reset();
        mockToastrService.danger.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
        expect(component.loginForm.value).toEqual({
            email: '',
            password: '',
            rememberMe: false
        });
    });

    it('should validate required email field', () => {
        const emailControl = component.loginForm.get('email');

        emailControl?.setValue('');
        emailControl?.markAsTouched();

        expect(emailControl?.hasError('required')).toBeTruthy();
        expect(component.getFieldStatus('email')).toBe('danger');
    });

    it('should validate email format', () => {
        const emailControl = component.loginForm.get('email');

        emailControl?.setValue('invalid-email');
        emailControl?.markAsTouched();

        expect(emailControl?.hasError('email')).toBeTruthy();
        expect(component.getFieldStatus('email')).toBe('danger');

        emailControl?.setValue('valid@email.com');
        expect(emailControl?.hasError('email')).toBeFalsy();
        expect(component.getFieldStatus('email')).toBe('success');
    });

    it('should validate password minimum length', () => {
        const passwordControl = component.loginForm.get('password');

        passwordControl?.setValue('123');
        passwordControl?.markAsTouched();

        expect(passwordControl?.hasError('minlength')).toBeTruthy();
        expect(component.getFieldStatus('password')).toBe('danger');

        passwordControl?.setValue('123456');
        expect(passwordControl?.hasError('minlength')).toBeFalsy();
        expect(component.getFieldStatus('password')).toBe('success');
    });

    it('should toggle password visibility', () => {
        expect(component.showPassword).toBeFalsy();

        component.togglePasswordVisibility();
        expect(component.showPassword).toBeTruthy();

        component.togglePasswordVisibility();
        expect(component.showPassword).toBeFalsy();
    });

    it('should not submit form if invalid', () => {
        spyOn(component as any, 'simulateLogin');

        component.onSubmit();

        expect((component as any).simulateLogin).not.toHaveBeenCalled();
        expect(component.isLoading).toBeFalsy();
    });

    it('should handle successful login', async () => {
        // Set valid form values
        component.loginForm.patchValue({
            email: 'admin@example.com',
            password: 'password123',
            rememberMe: true
        });

        component.onSubmit();

        // Wait for the simulated async operation
        await new Promise(resolve => setTimeout(resolve, 1600));

        expect(mockToastrService.success).toHaveBeenCalledWith('Connexion réussie !', 'Succès');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
        expect(localStorage.getItem('rememberMe')).toBe('true');
        expect(localStorage.getItem('savedEmail')).toBe('admin@example.com');
    });

    it('should handle failed login', async () => {
        // Set invalid credentials
        component.loginForm.patchValue({
            email: 'wrong@email.com',
            password: 'wrongpass',
            rememberMe: false
        });

        component.onSubmit();

        // Wait for the simulated async operation
        await new Promise(resolve => setTimeout(resolve, 1600));

        expect(component.loginError).toBe('Identifiants incorrects. Veuillez réessayer.');
        expect(mockToastrService.danger).toHaveBeenCalled();
        expect(component.isLoading).toBeFalsy();
    });

    it('should load remember me preference on init', () => {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', 'test@example.com');

        component.ngOnInit();

        expect(component.loginForm.get('rememberMe')?.value).toBeTruthy();
        expect(component.loginForm.get('email')?.value).toBe('test@example.com');
    });

    it('should clear remember me data when unchecked', async () => {
        // Set valid form values with rememberMe false
        component.loginForm.patchValue({
            email: 'admin@example.com',
            password: 'password123',
            rememberMe: false
        });

        component.onSubmit();

        // Wait for the simulated async operation
        await new Promise(resolve => setTimeout(resolve, 1600));

        expect(localStorage.getItem('rememberMe')).toBeNull();
        expect(localStorage.getItem('savedEmail')).toBeNull();
    });

    it('should mark all fields as touched when form is invalid on submit', () => {
        spyOn(component as any, 'markFormGroupTouched');

        component.onSubmit();

        expect((component as any).markFormGroupTouched).toHaveBeenCalled();
    });

    it('should return correct field status', () => {
        const emailControl = component.loginForm.get('email');

        // Untouched field should return 'basic'
        expect(component.getFieldStatus('email')).toBe('basic');

        // Touched invalid field should return 'danger'
        emailControl?.markAsTouched();
        expect(component.getFieldStatus('email')).toBe('danger');

        // Touched valid field should return 'success'
        emailControl?.setValue('test@example.com');
        expect(component.getFieldStatus('email')).toBe('success');
    });
});