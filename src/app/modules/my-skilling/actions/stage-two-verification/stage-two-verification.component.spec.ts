import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageTwoVerificationComponent } from './stage-two-verification.component';

describe('StageTwoVerificationComponent', () => {
  let component: StageTwoVerificationComponent;
  let fixture: ComponentFixture<StageTwoVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StageTwoVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageTwoVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
