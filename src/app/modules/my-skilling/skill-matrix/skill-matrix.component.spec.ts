import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillMatrixComponent } from './skill-matrix.component';

describe('SkillMatrixComponent', () => {
  let component: SkillMatrixComponent;
  let fixture: ComponentFixture<SkillMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkillMatrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
