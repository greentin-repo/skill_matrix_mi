import { TestBed } from '@angular/core/testing';

import { EmployeeAssessmentService } from './employee-assessment.service';

describe('EmployeeAssessmentService', () => {
  let service: EmployeeAssessmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeAssessmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
