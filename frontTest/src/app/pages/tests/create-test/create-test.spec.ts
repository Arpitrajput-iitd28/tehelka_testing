import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTestComponent } from './create-test';

describe('CreateTest', () => {
  let component: CreateTestComponent;
  let fixture: ComponentFixture<CreateTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
