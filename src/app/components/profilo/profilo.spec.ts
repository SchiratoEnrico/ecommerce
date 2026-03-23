import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Profilo } from './profilo';

describe('Profilo', () => {
  let component: Profilo;
  let fixture: ComponentFixture<Profilo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Profilo],
    }).compileComponents();

    fixture = TestBed.createComponent(Profilo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
