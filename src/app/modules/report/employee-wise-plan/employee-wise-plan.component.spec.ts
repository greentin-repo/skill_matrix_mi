import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeWisePlanComponent } from './employee-wise-plan.component';

describe('EmployeeWisePlanComponent', () => {
  let component: EmployeeWisePlanComponent;
  let fixture: ComponentFixture<EmployeeWisePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeWisePlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeWisePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
