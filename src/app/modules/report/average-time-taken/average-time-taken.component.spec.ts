import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageTimeTakenComponent } from './average-time-taken.component';

describe('AverageTimeTakenComponent', () => {
  let component: AverageTimeTakenComponent;
  let fixture: ComponentFixture<AverageTimeTakenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AverageTimeTakenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AverageTimeTakenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
