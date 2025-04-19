import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StageFourComponent } from './stage-four.component';

describe('StageFourComponent', () => {
  let component: StageFourComponent;
  let fixture: ComponentFixture<StageFourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StageFourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
