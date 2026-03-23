import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestioneAccount } from './gestione-account';

describe('GestioneAccount', () => {
  let component: GestioneAccount;
  let fixture: ComponentFixture<GestioneAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestioneAccount],
    }).compileComponents();

    fixture = TestBed.createComponent(GestioneAccount);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
