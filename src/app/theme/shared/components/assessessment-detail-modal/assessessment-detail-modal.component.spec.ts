import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessessmentDetailModalComponent } from './assessessment-detail-modal.component';

describe('AssessessmentDetailModalComponent', () => {
  let component: AssessessmentDetailModalComponent;
  let fixture: ComponentFixture<AssessessmentDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessessmentDetailModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessessmentDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
