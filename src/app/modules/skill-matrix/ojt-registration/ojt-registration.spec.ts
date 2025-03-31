import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OjtRegistrationComponent } from './ojt-registration.component';

describe('OjtRegistrationComponent', () => {
  let component: OjtRegistrationComponent;
  let fixture: ComponentFixture<OjtRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OjtRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OjtRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
