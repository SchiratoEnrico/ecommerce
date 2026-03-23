import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneAutori } from './gestione-autori';

describe('GestioneAutori', () => {
  let component: GestioneAutori;
  let fixture: ComponentFixture<GestioneAutori>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneAutori],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneAutori);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
