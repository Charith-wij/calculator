import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryDetailsComponent } from './summary-details.component';

describe('SummaryDetailsComponent', () => {
  let component: SummaryDetailsComponent;
  let fixture: ComponentFixture<SummaryDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryDetailsComponent]
    });
    fixture = TestBed.createComponent(SummaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
