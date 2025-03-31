import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddViewWorkforceComponent } from './add-view-workforce.component';

describe('AddViewWorkforceComponent', () => {
  let component: AddViewWorkforceComponent;
  let fixture: ComponentFixture<AddViewWorkforceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddViewWorkforceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddViewWorkforceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
