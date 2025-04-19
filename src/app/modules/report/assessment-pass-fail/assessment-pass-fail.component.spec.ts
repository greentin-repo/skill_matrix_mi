import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentPassFailComponent } from './assessment-pass-fail.component';

describe('AssessmentPassFailComponent', () => {
  let component: AssessmentPassFailComponent;
  let fixture: ComponentFixture<AssessmentPassFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentPassFailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentPassFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
