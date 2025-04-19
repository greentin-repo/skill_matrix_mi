import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageAndWorkflowComponent } from './stage-and-workflow.component';

describe('StageAndWorkflowComponent', () => {
  let component: StageAndWorkflowComponent;
  let fixture: ComponentFixture<StageAndWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StageAndWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageAndWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
