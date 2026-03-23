import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneCaseEditrici } from './gestione-case-editrici';

describe('GestioneCaseEditrici', () => {
  let component: GestioneCaseEditrici;
  let fixture: ComponentFixture<GestioneCaseEditrici>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneCaseEditrici],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneCaseEditrici);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
