import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellwiseMultitaskingComponent } from './cellwise-multitasking.component';

describe('CellwiseMultitaskingComponent', () => {
  let component: CellwiseMultitaskingComponent;
  let fixture: ComponentFixture<CellwiseMultitaskingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellwiseMultitaskingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CellwiseMultitaskingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
