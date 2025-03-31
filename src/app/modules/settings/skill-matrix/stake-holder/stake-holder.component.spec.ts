import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeHolderComponent } from './stake-holder.component';

describe('StakeHolderComponent', () => {
  let component: StakeHolderComponent;
  let fixture: ComponentFixture<StakeHolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StakeHolderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
