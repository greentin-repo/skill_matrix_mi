import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDetCycleComponent } from './action-det-cycle.component';

describe('ActionDetCycleComponent', () => {
  let component: ActionDetCycleComponent;
  let fixture: ComponentFixture<ActionDetCycleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionDetCycleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionDetCycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
