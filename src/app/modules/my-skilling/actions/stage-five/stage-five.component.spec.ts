import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageFiveComponent } from './stage-five.component';

describe('StageFiveComponent', () => {
  let component: StageFiveComponent;
  let fixture: ComponentFixture<StageFiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StageFiveComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageFiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
