import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../features/auth/auth.service';
import { EventEmitter } from '@angular/core';

class MockAuthService {
    private _isLoggedIn = false;
    setLoggedIn(val: boolean) { this._isLoggedIn = val; }
    isLoggedIn() { return this._isLoggedIn; }
}

class MockRouter {
    navigate = jasmine.createSpy('navigate');
}

describe('SearchBarComponent', () => {
    let component: SearchBarComponent;
    let fixture: ComponentFixture<SearchBarComponent>;
    let mockAuthService: MockAuthService;
    let mockRouter: MockRouter;

    beforeEach(async () => {
        mockAuthService = new MockAuthService();
        mockRouter = new MockRouter();

        await TestBed.configureTestingModule({
            imports: [SearchBarComponent],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SearchBarComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize isLoggedIn and tooltipText correctly when logged out', () => {
        mockAuthService.setLoggedIn(false);
        fixture = TestBed.createComponent(SearchBarComponent);
        component = fixture.componentInstance;
        expect(component.isLoggedIn).toBeFalse();
        expect(component.tooltipText).toBe('Iniciar sesión');
    });

    it('should initialize isLoggedIn and tooltipText correctly when logged in', () => {
        mockAuthService.setLoggedIn(true);
        fixture = TestBed.createComponent(SearchBarComponent);
        component = fixture.componentInstance;
        expect(component.isLoggedIn).toBeTrue();
        expect(component.tooltipText).toBe('Mi perfil');
    });

    it('should emit searchChange with searchQuery on onSearchInput', () => {
        spyOn(component.searchChange, 'emit');
        component.searchQuery = 'test query';
        component.onSearchInput();
        expect(component.searchChange.emit).toHaveBeenCalledWith('test query');
    });

    it('should navigate to /perfil when handleUserClick is called and user is logged in', () => {
        mockAuthService.setLoggedIn(true);
        fixture = TestBed.createComponent(SearchBarComponent);
        component = fixture.componentInstance;
        component.handleUserClick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/perfil']);
    });

    it('should navigate to /auth/login when handleUserClick is called and user is not logged in', () => {
        mockAuthService.setLoggedIn(false);
        fixture = TestBed.createComponent(SearchBarComponent);
        component = fixture.componentInstance;
        component.handleUserClick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
});