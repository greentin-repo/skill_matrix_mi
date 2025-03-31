import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCheckSheetPointsComponent } from './add-check-sheet-points.component';

describe('AddCheckSheetPointsComponent', () => {
  let component: AddCheckSheetPointsComponent;
  let fixture: ComponentFixture<AddCheckSheetPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCheckSheetPointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCheckSheetPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
