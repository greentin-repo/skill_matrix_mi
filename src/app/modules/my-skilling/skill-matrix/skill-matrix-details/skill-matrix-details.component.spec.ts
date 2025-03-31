import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillMatrixDetailsComponent } from './skill-matrix-details.component';

describe('SkillMatrixDetailsComponent', () => {
  let component: SkillMatrixDetailsComponent;
  let fixture: ComponentFixture<SkillMatrixDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillMatrixDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillMatrixDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
