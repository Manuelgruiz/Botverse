import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GridBotComponent } from './grid-bot.component';
import { BotCardComponent, BotCard } from '../bot-card/bot-card.component';
import { GraphqlService } from '../../graphql/services/graphql.service';
import { FavoritesService } from '../bot-card/favorites.service';
import { AuthService } from '../../../../features/auth/auth.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('GridBotComponent', () => {
    let component: GridBotComponent;
    let fixture: ComponentFixture<GridBotComponent>;
    let mockGraphqlService: jasmine.SpyObj<GraphqlService>;
    let mockFavoritesService: jasmine.SpyObj<FavoritesService>;
    let mockAuthService: jasmine.SpyObj<AuthService>;

    const botsMock = [
        {
            id: 1,
            name: 'Bot One',
            sourcePlatform: 'Telegram',
            categories: ['Utility'],
            images: [{ type: 'logo', url: 'logo1.png' }]
        },
        {
            id: 2,
            name: 'Bot Two',
            sourcePlatform: 'Discord',
            categories: ['Fun'],
            images: [{ type: 'logo', url: 'logo2.png' }]
        }
    ];

    beforeEach(async () => {
        mockGraphqlService = jasmine.createSpyObj('GraphqlService', ['getBasicBots']);
        mockFavoritesService = jasmine.createSpyObj('FavoritesService', ['getUserFavorites', 'addFavorite', 'removeFavorite']);
        mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

        await TestBed.configureTestingModule({
            imports: [GridBotComponent, CommonModule, BotCardComponent],
            providers: [
                { provide: GraphqlService, useValue: mockGraphqlService },
                { provide: FavoritesService, useValue: mockFavoritesService },
                { provide: AuthService, useValue: mockAuthService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GridBotComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('loadBots', () => {
        it('should load bots and apply filters', fakeAsync(() => {
            mockGraphqlService.getBasicBots.and.returnValue(of({ data: { bots: botsMock } }));
            component.favoriteBots = [1];
            spyOn(component as any, 'applyFilters');

            component.loadBots();
            tick();

            expect(component.allBots.length).toBe(2);
            expect(component.allBots[0].isFavorite).toBeTrue();
            expect(component.allBots[1].isFavorite).toBeFalse();
            expect((component as any).applyFilters).toHaveBeenCalled();
            expect(component.isLoading).toBeFalse();
            expect(component.error).toBeNull();
        }));

        it('should handle error when loading bots', fakeAsync(() => {
            mockGraphqlService.getBasicBots.and.returnValue(throwError(() => new Error('fail')));
            spyOn(console, 'error');

            component.loadBots();
            tick();

            expect(component.error).toBe('Error al cargar los bots');
            expect(component.isLoading).toBeFalse();
            expect(console.error).toHaveBeenCalled();
        }));
    });

    describe('loadFavorites', () => {
        it('should not load favorites if not logged in', () => {
            mockAuthService.isLoggedIn.and.returnValue(false);
            component.allBots = [];
            component['loadFavorites']();
            expect(mockFavoritesService.getUserFavorites).not.toHaveBeenCalled();
        });

        it('should load favorites and update bots', fakeAsync(() => {
            mockAuthService.isLoggedIn.and.returnValue(true);
            mockFavoritesService.getUserFavorites.and.returnValue(of([{ botId: 2 }]));
            component.allBots = [
                { id: 1, header: 'Bot One', category: 'Telegram', labels: [], images: '', isFavorite: false },
                { id: 2, header: 'Bot Two', category: 'Discord', labels: [], images: '', isFavorite: false }
            ];
            spyOn(component as any, 'applyFilters');

            component['loadFavorites']();
            tick();

            expect(component.favoriteBots).toEqual([2]);
            expect(component.allBots[0].isFavorite).toBeFalse();
            expect(component.allBots[1].isFavorite).toBeTrue();
            expect((component as any).applyFilters).toHaveBeenCalled();
        }));

        it('should handle error when loading favorites', fakeAsync(() => {
            mockAuthService.isLoggedIn.and.returnValue(true);
            mockFavoritesService.getUserFavorites.and.returnValue(throwError(() => new Error('fail')));
            spyOn(console, 'error');
            component['loadFavorites']();
            tick();
            expect(console.error).toHaveBeenCalled();
        }));
    });

    describe('applyFilters', () => {
        beforeEach(() => {
            component.allBots = [
                { id: 1, header: 'Bot One', category: 'Telegram', labels: [], images: '', isFavorite: true },
                { id: 2, header: 'Bot Two', category: 'Discord', labels: [], images: '', isFavorite: false }
            ];
        });

        it('should filter by platform', () => {
            component.filterPlatform = 'Telegram';
            component.searchQuery = '';
            component.showOnlyFavorites = false;
            component['applyFilters']();
            expect(component.filteredBots.length).toBe(1);
            expect(component.filteredBots[0].category).toBe('Telegram');
        });

        it('should filter by search query', () => {
            component.filterPlatform = null;
            component.searchQuery = 'two';
            component.showOnlyFavorites = false;
            component['applyFilters']();
            expect(component.filteredBots.length).toBe(1);
            expect(component.filteredBots[0].header).toBe('Bot Two');
        });

        it('should filter by favorites', () => {
            component.filterPlatform = null;
            component.searchQuery = '';
            component.showOnlyFavorites = true;
            component['applyFilters']();
            expect(component.filteredBots.length).toBe(1);
            expect(component.filteredBots[0].isFavorite).toBeTrue();
        });

        it('should combine filters', () => {
            component.filterPlatform = 'Telegram';
            component.searchQuery = 'one';
            component.showOnlyFavorites = true;
            component['applyFilters']();
            expect(component.filteredBots.length).toBe(1);
            expect(component.filteredBots[0].header).toBe('Bot One');
        });
    });

    describe('toggleFavorite', () => {
        beforeEach(() => {
            component.allBots = [
                { id: 1, header: 'Bot One', category: 'Telegram', labels: [], images: '', isFavorite: false }
            ];
        });

        it('should not toggle favorite if not logged in', () => {
            mockAuthService.isLoggedIn.and.returnValue(false);
            component.toggleFavorite(1);
            expect(mockFavoritesService.addFavorite).not.toHaveBeenCalled();
            expect(mockFavoritesService.removeFavorite).not.toHaveBeenCalled();
        });

        it('should add favorite if not already favorite', fakeAsync(() => {
            mockAuthService.isLoggedIn.and.returnValue(true);
            mockFavoritesService.addFavorite.and.returnValue(of({}));
            component.showOnlyFavorites = false;

            component.toggleFavorite(1);
            tick();

            expect(component.allBots[0].isFavorite).toBeTrue();
            expect(component.favoriteBots).toContain(1);
        }));

        it('should remove favorite if already favorite', fakeAsync(() => {
            component.allBots[0].isFavorite = true;
            component.favoriteBots = [1];
            mockAuthService.isLoggedIn.and.returnValue(true);
            mockFavoritesService.removeFavorite.and.returnValue(of({}));
            component.showOnlyFavorites = false;

            component.toggleFavorite(1);
            tick();

            expect(component.allBots[0].isFavorite).toBeFalse();
            expect(component.favoriteBots).not.toContain(1);
        }));
    });

    it('should set selectedBotId on selectBot', () => {
        component.selectBot(42);
        expect(component.selectedBotId).toBe(42);
    });

    it('should track by bot id', () => {
        const bot: BotCard = { id: 123, header: '', category: '', labels: [], images: '', isFavorite: false };
        expect(component.trackByBotId(0, bot)).toBe(123);
    });

    describe('ngOnChanges', () => {
        it('should apply filters and load favorites on isLoggedIn change', () => {
            spyOn(component as any, 'applyFilters');
            spyOn(component as any, 'loadFavorites');
            component.ngOnChanges({
                isLoggedIn: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
            });
            expect((component as any).applyFilters).toHaveBeenCalled();
            expect((component as any).loadFavorites).toHaveBeenCalled();
        });

        it('should apply filters on filterPlatform change', () => {
            spyOn(component as any, 'applyFilters');
            component.ngOnChanges({
                filterPlatform: { currentValue: 'Telegram', previousValue: null, firstChange: false, isFirstChange: () => false }
            });
            expect((component as any).applyFilters).toHaveBeenCalled();
        });
    });

    describe('ngOnInit', () => {
        it('should call loadBots and loadFavorites if logged in', () => {
            spyOn(component, 'loadBots');
            spyOn(component as any, 'loadFavorites');
            component.isLoggedIn = true;
            component.ngOnInit();
            expect(component.loadBots).toHaveBeenCalled();
            expect((component as any).loadFavorites).toHaveBeenCalled();
        });

        it('should call loadBots only if not logged in', () => {
            spyOn(component, 'loadBots');
            spyOn(component as any, 'loadFavorites');
            component.isLoggedIn = false;
            component.ngOnInit();
            expect(component.loadBots).toHaveBeenCalled();
            expect((component as any).loadFavorites).not.toHaveBeenCalled();
        });
    });
});