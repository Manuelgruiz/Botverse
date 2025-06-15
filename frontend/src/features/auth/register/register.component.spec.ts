import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['register']);
        const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [RegisterComponent],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routeSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call AuthService.register and navigate on success', fakeAsync(() => {
        const userData = { name: 'Test', email: 'test@example.com', password: '123456' };
        authServiceSpy.register.and.returnValue(of({}));

        component.handleRegister(userData);
        tick();

        expect(authServiceSpy.register).toHaveBeenCalledWith(userData);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        expect(component.registerError).toBeNull();
    }));

    it('should set registerError on registration failure', fakeAsync(() => {
        const userData = { name: 'Test', email: 'test@example.com', password: '123456' };
        const errorResponse = { error: { message: 'Email already exists' } };
        authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

        component.handleRegister(userData);
        tick();

        expect(authServiceSpy.register).toHaveBeenCalledWith(userData);
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        expect(component.registerError).toBe('Email already exists');
    }));

    it('should set default error message if error response does not have message', fakeAsync(() => {
        const userData = { name: 'Test', email: 'test@example.com', password: '123456' };
        const errorResponse = { error: {} };
        authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

        component.handleRegister(userData);
        tick();

        expect(component.registerError).toBe('Registration failed. Please try again.');
    }));

    it('should reset registerError before attempting registration', fakeAsync(() => {
        component.registerError = 'Some previous error';
        const userData = { name: 'Test', email: 'test@example.com', password: '123456' };
        authServiceSpy.register.and.returnValue(of({}));

        component.handleRegister(userData);
        tick();

        expect(component.registerError).toBeNull();
    }));
});