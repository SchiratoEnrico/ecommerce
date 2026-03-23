import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneGeneri } from './gestione-generi';

describe('GestioneGeneri', () => {
  let component: GestioneGeneri;
  let fixture: ComponentFixture<GestioneGeneri>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneGeneri],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneGeneri);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
