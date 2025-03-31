import { TestBed } from '@angular/core/testing';

import { SkillingService } from './skilling.service';

describe('SkillingService', () => {
  let service: SkillingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SkillingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
