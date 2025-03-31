import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySkillingComponent } from './my-skilling.component';

describe('MySkillingComponent', () => {
  let component: MySkillingComponent;
  let fixture: ComponentFixture<MySkillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MySkillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MySkillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
