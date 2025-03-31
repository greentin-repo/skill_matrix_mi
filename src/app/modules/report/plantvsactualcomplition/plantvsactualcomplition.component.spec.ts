import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantvsactualcomplitionComponent } from './plantvsactualcomplition.component';

describe('PlantvsactualcomplitionComponent', () => {
  let component: PlantvsactualcomplitionComponent;
  let fixture: ComponentFixture<PlantvsactualcomplitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlantvsactualcomplitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlantvsactualcomplitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
