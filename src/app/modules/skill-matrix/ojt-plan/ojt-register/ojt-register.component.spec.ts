import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OjtRegisterComponent } from './ojt-register.component';

describe('OjtRegisterComponent', () => {
  let component: OjtRegisterComponent;
  let fixture: ComponentFixture<OjtRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OjtRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OjtRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
