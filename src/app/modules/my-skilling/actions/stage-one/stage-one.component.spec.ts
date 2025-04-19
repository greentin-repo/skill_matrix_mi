import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDetComponent } from './stage-one.component';

describe('ActionDetComponent', () => {
  let component: ActionDetComponent;
  let fixture: ComponentFixture<ActionDetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionDetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionDetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
