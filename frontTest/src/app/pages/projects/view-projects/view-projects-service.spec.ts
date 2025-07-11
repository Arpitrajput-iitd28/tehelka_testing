import { TestBed } from '@angular/core/testing';

import { ViewProjectsService } from './view-projects-service';

describe('ViewProjectsService', () => {
  let service: ViewProjectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewProjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
