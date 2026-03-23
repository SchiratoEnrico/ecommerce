import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneOrdini } from './gestione-ordini';

describe('GestioneOrdini', () => {
  let component: GestioneOrdini;
  let fixture: ComponentFixture<GestioneOrdini>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneOrdini],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneOrdini);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
