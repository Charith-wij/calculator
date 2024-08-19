import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetGroupsComponent } from './asset-groups.component';

describe('AssetGroupsComponent', () => {
  let component: AssetGroupsComponent;
  let fixture: ComponentFixture<AssetGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetGroupsComponent]
    });
    fixture = TestBed.createComponent(AssetGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
