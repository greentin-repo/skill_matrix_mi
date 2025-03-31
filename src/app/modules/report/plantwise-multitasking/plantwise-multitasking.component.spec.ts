import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantwiseMultitaskingComponent } from './plantwise-multitasking.component';

describe('PlantwiseMultitaskingComponent', () => {
  let component: PlantwiseMultitaskingComponent;
  let fixture: ComponentFixture<PlantwiseMultitaskingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlantwiseMultitaskingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantwiseMultitaskingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
