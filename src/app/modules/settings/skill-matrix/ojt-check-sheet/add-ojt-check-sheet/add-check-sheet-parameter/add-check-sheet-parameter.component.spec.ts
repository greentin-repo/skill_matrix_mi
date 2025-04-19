import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCheckSheetParameterComponent } from './add-check-sheet-parameter.component';

describe('AddCheckSheetParameterComponent', () => {
  let component: AddCheckSheetParameterComponent;
  let fixture: ComponentFixture<AddCheckSheetParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCheckSheetParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCheckSheetParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
