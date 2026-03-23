import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionePagamenti } from './gestione-pagamenti';

describe('GestionePagamenti', () => {
  let component: GestionePagamenti;
  let fixture: ComponentFixture<GestionePagamenti>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionePagamenti],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionePagamenti);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
