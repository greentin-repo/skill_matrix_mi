import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OjtRegistrationDetailsComponent } from './ojt-registration-details.component';

describe('OjtRegistrationDetailsComponent', () => {
  let component: OjtRegistrationDetailsComponent;
  let fixture: ComponentFixture<OjtRegistrationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OjtRegistrationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OjtRegistrationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
