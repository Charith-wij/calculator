import { Component, Input, OnInit } from '@angular/core';

import { AssetGroupsService } from '../../../services/asset-groups.service';
import { Asset } from '../../../models/forecast/asset.model';
import { FormControl } from '@angular/forms';
import { ForecasterStateService } from 'src/app/services/forecaster-state.service';

@Component({
  selector: 'app-asset-groups',
  templateUrl: './asset-groups.component.html',
  styleUrls: ['./asset-groups.component.scss']
})
export class AssetGroupsComponent implements OnInit {
  @Input() currentGroupsAssets: Asset[] = [];
  savedStateNames: string[] = [];
  saveNameControl = new FormControl("");

  constructor(private assetGroupsService: AssetGroupsService,
    private readonly stateService: ForecasterStateService) {}

  ngOnInit(): void {
    this.updateSavedStateNames();
  }

  saveData(name: string): void {
    if (name) {
      this.assetGroupsService.saveGroup(name, this.currentGroupsAssets, true);
      this.updateSavedStateNames();
    }
    this.saveNameControl.setValue("");
  }

  removeGroup(name: string): void {
    this.assetGroupsService.removegroup(name);
    this.updateSavedStateNames();
  }

  loadData(name: string): void {
    const loadedData = this.assetGroupsService.loadGroup(name);
  }

  private updateSavedStateNames(): void {
    this.savedStateNames = this.assetGroupsService.getGroupNames();
  }
}
