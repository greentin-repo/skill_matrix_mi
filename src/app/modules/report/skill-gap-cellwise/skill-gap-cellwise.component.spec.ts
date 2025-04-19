import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillGapCellwiseComponent } from './skill-gap-cellwise.component';

describe('SkillGapCellwiseComponent', () => {
  let component: SkillGapCellwiseComponent;
  let fixture: ComponentFixture<SkillGapCellwiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillGapCellwiseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillGapCellwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
