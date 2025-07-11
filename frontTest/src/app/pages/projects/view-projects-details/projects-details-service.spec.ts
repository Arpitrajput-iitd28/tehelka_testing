import { TestBed } from '@angular/core/testing';

import { ProjectsDetailsService } from './projects-details-service';

describe('ProjectsDetailsService', () => {
  let service: ProjectsDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectsDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
