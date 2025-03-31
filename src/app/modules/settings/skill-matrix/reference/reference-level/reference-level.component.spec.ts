import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceLevelComponent } from './reference-level.component';

describe('ReferenceLevelComponent', () => {
  let component: ReferenceLevelComponent;
  let fixture: ComponentFixture<ReferenceLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceLevelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
