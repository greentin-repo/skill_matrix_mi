import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOjtCheckSheetComponent } from './add-ojt-check-sheet.component';

describe('AddOjtCheckSheetComponent', () => {
  let component: AddOjtCheckSheetComponent;
  let fixture: ComponentFixture<AddOjtCheckSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOjtCheckSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOjtCheckSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
