import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProjectsComponent } from './manage-projects';

describe('ManageProjects', () => {
  let component: ManageProjectsComponent;
  let fixture: ComponentFixture<ManageProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
