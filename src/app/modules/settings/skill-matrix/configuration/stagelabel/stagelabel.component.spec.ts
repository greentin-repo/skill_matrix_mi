import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StagelabelComponent } from './stagelabel.component';

describe('StagelabelComponent', () => {
  let component: StagelabelComponent;
  let fixture: ComponentFixture<StagelabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StagelabelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StagelabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
