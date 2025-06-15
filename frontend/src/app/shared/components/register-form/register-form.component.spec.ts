import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterFormComponent } from './register-form.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('RegisterFormComponent', () => {
    let component: RegisterFormComponent;
    let fixture: ComponentFixture<RegisterFormComponent>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [RegisterFormComponent, ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: Router, useValue: routerSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with empty values', () => {
        expect(component.registerForm.value).toEqual({
            name: '',
            email: '',
            password: ''
        });
    });

    it('should be invalid when form is empty', () => {
        expect(component.registerForm.valid).toBeFalse();
    });

    it('should validate name field (required, minLength)', () => {
        const name = component.registerForm.get('name');
        name?.setValue('');
        expect(name?.valid).toBeFalse();
        name?.setValue('ab');
        expect(name?.valid).toBeFalse();
        name?.setValue('abc');
        expect(name?.valid).toBeTrue();
    });

    it('should validate email field (required, email)', () => {
        const email = component.registerForm.get('email');
        email?.setValue('');
        expect(email?.valid).toBeFalse();
        email?.setValue('invalid-email');
        expect(email?.valid).toBeFalse();
        email?.setValue('test@example.com');
        expect(email?.valid).toBeTrue();
    });

    it('should validate password field (required, minLength)', () => {
        const password = component.registerForm.get('password');
        password?.setValue('');
        expect(password?.valid).toBeFalse();
        password?.setValue('12345');
        expect(password?.valid).toBeFalse();
        password?.setValue('123456');
        expect(password?.valid).toBeTrue();
    });

    it('should emit registerSubmit with form value when form is valid and onSubmit is called', () => {
        spyOn(component.registerSubmit, 'emit');
        component.registerForm.setValue({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
        });
        component.onSubmit();
        expect(component.registerSubmit.emit).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
        });
    });

    it('should not emit registerSubmit when form is invalid', () => {
        spyOn(component.registerSubmit, 'emit');
        component.registerForm.setValue({
            name: '',
            email: 'invalid',
            password: ''
        });
        component.onSubmit();
        expect(component.registerSubmit.emit).not.toHaveBeenCalled();
    });

    it('should navigate to login when navigateToLogin is called', () => {
        component.navigateToLogin();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should accept registerError input', () => {
        component.registerError = 'Some error';
        expect(component.registerError).toBe('Some error');
    });
});