import { TestBed } from '@angular/core/testing';

import { CreateTestService } from './create-test-service';

describe('CreateTestService', () => {
  let service: CreateTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
