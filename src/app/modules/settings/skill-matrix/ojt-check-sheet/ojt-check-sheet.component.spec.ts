import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OjtCheckSheetComponent } from './ojt-check-sheet.component';

describe('OjtCheckSheetComponent', () => {
  let component: OjtCheckSheetComponent;
  let fixture: ComponentFixture<OjtCheckSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OjtCheckSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OjtCheckSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
