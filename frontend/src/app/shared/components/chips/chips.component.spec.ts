import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipsComponent } from './chips.component';

describe('ChipsComponent', () => {
  let component: ChipsComponent;
  let fixture: ComponentFixture<ChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería renderizar todas las chips', () => {
    const chips = fixture.nativeElement.querySelectorAll('.chip');
    expect(chips.length).toBe(component.chips.length);
  });

  it('cada chip debería mostrar el texto y el color correcto', () => {
    const chipEls = fixture.nativeElement.querySelectorAll('.chip');

    chipEls.forEach((el: HTMLElement, index: number) => {
      const chipData = component.chips[index];
      const computed = getComputedStyle(el).backgroundColor;
      const expected = toRgb(chipData.color.toLowerCase());

      expect(el.textContent?.trim()).toBe(chipData.text);
      expect(computed).toBe(expected);
    });
  });
});

function toRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}
