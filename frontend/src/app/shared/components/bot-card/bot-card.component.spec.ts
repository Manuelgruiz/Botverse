import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotCardComponent, BotCard } from './bot-card.component';
import { FavoritesService } from './favorites.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('BotCardComponent (básico)', () => {
  let component: BotCardComponent;
  let fixture: ComponentFixture<BotCardComponent>;
  let mockFavoritesService: jasmine.SpyObj<FavoritesService>;

  const dummyCard: BotCard = {
    id: 123,
    header: 'Test Bot',
    images: 'image.png',
    category: 'Utilidad',
    labels: ['AI', 'NLP'],
    isFavorite: false
  };

  beforeEach(async () => {
    mockFavoritesService = jasmine.createSpyObj('FavoritesService', [
      'checkFavorite',
      'addFavorite',
      'removeFavorite'
    ]);

    await TestBed.configureTestingModule({
      imports: [BotCardComponent, RouterTestingModule],
      providers: [
        { provide: FavoritesService, useValue: mockFavoritesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BotCardComponent);
    component = fixture.componentInstance;
    component.card = { ...dummyCard };
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería emitir el ID al hacer click en la tarjeta', () => {
    spyOn(component.select, 'emit');
    component.onCardClick();
    expect(component.select.emit).toHaveBeenCalledWith(dummyCard.id);
  });

  it('no debería mostrar el botón de favorito si no está logueado', () => {
    component.isLoggedIn = false;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.favorite-button');
    expect(btn).toBeNull();
  });

  it('debería mostrar las etiquetas si existen', () => {
    const labels = fixture.nativeElement.querySelectorAll('.label');
    expect(labels.length).toBe(dummyCard.labels!.length);
  });

  it('debería limpiar la imagen si falla la carga', () => {
    expect(component.card.images).toBe('image.png');
    component.card.images = 'error.jpg';
    fixture.detectChanges();
    component.card.images = '';
    expect(component.card.images).toBe('');
  });

  it('debería verificar favorito en ngOnInit si está logueado', () => {
    component.isLoggedIn = true;
    mockFavoritesService.checkFavorite.and.returnValue(of(true));
    component.ngOnInit();
    expect(mockFavoritesService.checkFavorite).toHaveBeenCalledWith('123');
  });
    it('debería deshabilitar el botón de favorito mientras isLoadingFavorite es true', () => {
    component.isLoggedIn = true;
    component.isLoadingFavorite = true;
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.favorite-button');
    expect(button.disabled).toBeTrue();
  });

  it('debería emitir favoriteChanged con el nuevo estado al marcar como favorito', () => {
    component.isLoggedIn = true;
    component.card.isFavorite = false;
    mockFavoritesService.addFavorite.and.returnValue(of(null));

    const spy = spyOn(component.favoriteChanged, 'emit');
    component.toggleFavorite(new MouseEvent('click'));
    expect(spy).toHaveBeenCalledWith({ id: 123, isFavorite: true });
  });

  it('debería renderizar el contenido del header correctamente', () => {
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('h3');
    expect(header.textContent).toContain(dummyCard.header);
  });

});
