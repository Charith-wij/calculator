import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Asset } from '../../../models/forecast/asset.model';
import { ForecasterStateService } from 'src/app/services/forecaster-state.service';
import { AssetGroupsService } from '../../../services/asset-groups.service';
import { StateModel } from '../../../models/forecast/forecast-state.model';
import { SavedAssetGroupItem } from '../../../models/forecast/saved-asset-group-item.model';

@Component({
  selector: 'app-asset-grid',
  templateUrl: './asset-grid.component.html',
  styleUrls: ['./asset-grid.component.scss']
})
export class AssetGridComponent implements OnInit {
  @Input() dataSource: Asset[] = [];

  displayedColumns: string[] = ['completionDate', 'assetType', 'profitAtExit', 'cashflowPerMonth', 'propertyValue', 'purchasePrice', 'mortgage', 'equity', 'remove'];
  tableDataSource = new MatTableDataSource<Asset>([]);

  constructor(
    private readonly stateService: ForecasterStateService,
    private assetGroupsService: AssetGroupsService) {
  }

  ngOnInit(): void {
    this.assetGroupsService.assetGroupChanged.subscribe((data: SavedAssetGroupItem) => {
      this.updateSummaryDetails(data.currentState!);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      this.tableDataSource.data = this.dataSource;
      console.log(this.dataSource);
    }
  }

  updateSummaryDetails(currentState: StateModel) {
    this.stateService.resetState();
    if (currentState != null) {
      this.stateService.setState(currentState);
    }
  }

  removeRow(index: number): void {
    const data = this.tableDataSource.data;

    const removingAsset = data[index];

    if (removingAsset.assetType === 'flip') {
      this.stateService.updateBankBalance(Number(removingAsset.profitAtExit)! * -1);
    }
    else {
      this.stateService.updateCashflow(Number(removingAsset.cashflowPerMonth)! * -1);
      this.stateService.updateBankBalance(Number(removingAsset.cashLeftIn)!);
      this.stateService.updateMortgage(Number(removingAsset.mortgage)! * -1);
      this.stateService.updateEquity(Number(removingAsset.equity)! * -1);
    }

    data.splice(index, 1);
    this.tableDataSource.data = [...data];
    this.dataSource = [...data];
  }
} 