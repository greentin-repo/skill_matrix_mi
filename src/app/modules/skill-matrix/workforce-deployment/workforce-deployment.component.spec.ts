import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkforceDeploymentComponent } from './workforce-deployment.component';

describe('WorkforceDeploymentComponent', () => {
  let component: WorkforceDeploymentComponent;
  let fixture: ComponentFixture<WorkforceDeploymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkforceDeploymentComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkforceDeploymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
