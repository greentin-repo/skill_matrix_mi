import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantLevelAdherenceComponent } from './plant-level-adherence.component';

describe('PlantLevelAdherenceComponent', () => {
  let component: PlantLevelAdherenceComponent;
  let fixture: ComponentFixture<PlantLevelAdherenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlantLevelAdherenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantLevelAdherenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
