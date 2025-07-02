import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTestsComponent } from './view-tests';

describe('ViewTests', () => {
  let component: ViewTestsComponent;
  let fixture: ComponentFixture<ViewTestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
