import { TestBed } from '@angular/core/testing';

import { SkillMatrixService } from './skill-matrix.service';

describe('SkillMatrixService', () => {
  let service: SkillMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkillMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
