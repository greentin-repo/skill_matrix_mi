import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceGapReasonComponent } from './reference-gap-reason.component';

describe('ReferenceGapReasonComponent', () => {
  let component: ReferenceGapReasonComponent;
  let fixture: ComponentFixture<ReferenceGapReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceGapReasonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceGapReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
