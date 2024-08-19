import { EventEmitter, Injectable, Output } from '@angular/core';

import { Asset } from '../models/forecast/asset.model';
import { ForecasterStateService } from './forecaster-state.service';
import { take } from 'rxjs/operators';
import { StateModel } from '../models/forecast/forecast-state.model';
import { SavedAssetGroupItem } from '../models/forecast/saved-asset-group-item.model';

@Injectable({
  providedIn: 'root'
})
export class AssetGroupsService {

  @Output() public assetGroupChanged = new EventEmitter<SavedAssetGroupItem>();
  public activeGroupName: string = "";
  private storageKey = 'assetGroups';

  constructor(private readonly stateService: ForecasterStateService) { }

  saveGroup(name: string, data: Asset[], clearTheLists?: boolean): void {
    this.stateService.getState()
      .pipe(take(1))
      .subscribe((state: StateModel) => {
        let savedEntry = this.getSavedGroups();

        if (savedEntry[name] == null) {
          savedEntry = {...savedEntry,
            [name]: {
              assets: data,
              currentState: state
            }
          }
        }
        else {
          savedEntry[name].assets = data;
          savedEntry[name].currentState = state;
        }

        localStorage.setItem(this.storageKey, JSON.stringify(savedEntry));

        if (clearTheLists) {
          this.assetGroupChanged.emit({ currentState: null, assets: [] });
        }
      });
  }

  loadGroup(name: string): SavedAssetGroupItem {
    const savedEntry = this.getSavedGroups();
    this.assetGroupChanged.emit(savedEntry[name]);
    this.activeGroupName = name;

    return savedEntry[name] || null;
  }

  getGroupNames(): string[] {
    return Object.keys(this.getSavedGroups());
  }

  removegroup(name: string): void {
    const savedStates = this.getSavedGroups();
    delete savedStates[name];
    localStorage.setItem(this.storageKey, JSON.stringify(savedStates));
    this.assetGroupChanged.emit({ currentState: null, assets: [] });
  }

  private getSavedGroups(): { [key: string]: SavedAssetGroupItem } {
    const savedStates = localStorage.getItem(this.storageKey);

    return savedStates ? JSON.parse(savedStates) : {};
  }
}
