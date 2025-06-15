import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../../features/auth/auth.service';
import { Router } from '@angular/router';
import { FavoritesService } from '../bot-card/favorites.service';
import { EventEmitter } from '@angular/core';

class MockAuthService {
    logout = jasmine.createSpy('logout');
}
class MockRouter {
    navigate = jasmine.createSpy('navigate');
}
class MockFavoritesService {}

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let authService: MockAuthService;
    let router: MockRouter;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers: [
                { provide: AuthService, useClass: MockAuthService },
                { provide: Router, useClass: MockRouter },
                { provide: FavoritesService, useClass: MockFavoritesService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as any;
        router = TestBed.inject(Router) as any;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle isCollapsed when toggleSidebar is called', () => {
        const initial = component.isCollapsed;
        component.toggleSidebar();
        expect(component.isCollapsed).toBe(!initial);
    });

    it('should emit platformSelected with correct value when selectPlatform is called', () => {
        spyOn(component.platformSelected, 'emit');
        component.selectPlatform('test-platform');
        expect(component.platformSelected.emit).toHaveBeenCalledWith('test-platform');
    });

    it('should emit showFavorites when onShowFavorites is called', () => {
        spyOn(component.showFavorites, 'emit');
        component.onShowFavorites();
        expect(component.showFavorites.emit).toHaveBeenCalled();
    });

    it('should call authService.logout and navigate to /login on logout', () => {
        component.logout();
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should have activePlatform as null by default', () => {
        expect(component.activePlatform).toBeNull();
    });
});