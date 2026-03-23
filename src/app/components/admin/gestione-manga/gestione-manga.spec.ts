import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneManga } from './gestione-manga';

describe('GestioneManga', () => {
  let component: GestioneManga;
  let fixture: ComponentFixture<GestioneManga>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneManga],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneManga);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
