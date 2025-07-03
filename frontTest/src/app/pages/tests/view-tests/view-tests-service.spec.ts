import { TestBed } from '@angular/core/testing';

import { ViewTestsService } from './view-tests-service';

describe('ViewTestsService', () => {
  let service: ViewTestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewTestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
