import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneSpedizioni } from './gestione-spedizioni';

describe('GestioneSpedizioni', () => {
  let component: GestioneSpedizioni;
  let fixture: ComponentFixture<GestioneSpedizioni>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneSpedizioni],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneSpedizioni);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
