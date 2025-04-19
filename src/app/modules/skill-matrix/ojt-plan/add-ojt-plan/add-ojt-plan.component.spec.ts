import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOjtPlanComponent } from './add-ojt-plan.component';

describe('AddOjtPlanComponent', () => {
  let component: AddOjtPlanComponent;
  let fixture: ComponentFixture<AddOjtPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOjtPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOjtPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
