import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellLevelAdherenceComponent } from './cell-level-adherence.component';

describe('CellLevelAdherenceComponent', () => {
  let component: CellLevelAdherenceComponent;
  let fixture: ComponentFixture<CellLevelAdherenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellLevelAdherenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CellLevelAdherenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
