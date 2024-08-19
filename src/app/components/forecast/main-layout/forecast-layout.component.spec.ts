import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastLayoutComponent } from './forecast-layout.component';

describe('MainLayoutComponent', () => {
  let component: ForecastLayoutComponent;
  let fixture: ComponentFixture<ForecastLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForecastLayoutComponent]
    });
    fixture = TestBed.createComponent(ForecastLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
