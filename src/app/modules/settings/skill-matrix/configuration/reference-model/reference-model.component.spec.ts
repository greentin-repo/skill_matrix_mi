import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceModelComponent } from './reference-model.component';

describe('ReferenceModelComponent', () => {
  let component: ReferenceModelComponent;
  let fixture: ComponentFixture<ReferenceModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
