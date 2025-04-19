import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillMatrixCellwisePlantwiseComponent } from './skill-matrix-cellwise-plantwise.component';

describe('SkillMatrixCellwisePlantwiseComponent', () => {
  let component: SkillMatrixCellwisePlantwiseComponent;
  let fixture: ComponentFixture<SkillMatrixCellwisePlantwiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillMatrixCellwisePlantwiseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillMatrixCellwisePlantwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
