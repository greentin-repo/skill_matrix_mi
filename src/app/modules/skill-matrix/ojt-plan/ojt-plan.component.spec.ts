import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OjtPlanComponent } from './ojt-plan.component';

describe('OjtPlanComponent', () => {
  let component: OjtPlanComponent;
  let fixture: ComponentFixture<OjtPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OjtPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OjtPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
