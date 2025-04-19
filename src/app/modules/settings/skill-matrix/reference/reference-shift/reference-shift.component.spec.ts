import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceShiftComponent } from './reference-shift.component';

describe('ReferenceShiftComponent', () => {
  let component: ReferenceShiftComponent;
  let fixture: ComponentFixture<ReferenceShiftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceShiftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
