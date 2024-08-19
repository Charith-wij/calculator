import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AddAssetDialogComponent } from '../add-asset-dialog/add-asset-dialog.component';
import { Asset } from '../../../models/forecast/asset.model';
import { AssetGroupsService } from '../../../services/asset-groups.service';
import { SavedAssetGroupItem } from '../../../models/forecast/saved-asset-group-item.model';

@Component({
  selector: 'app-forecast-layout',
  templateUrl: './forecast-layout.component.html',
  styleUrls: ['./forecast-layout.component.scss']
})
export class ForecastLayoutComponent implements OnInit {
  assets: Asset[] = [];

  constructor(public dialog: MatDialog, private assetGroupsService: AssetGroupsService) { }

  ngOnInit() {
    this.assetGroupsService.assetGroupChanged
      .subscribe((data: SavedAssetGroupItem) => {
        this.assets = data.assets;
      })
  }

  openAddAssetDialog(): void {
    const dialogRef = this.dialog.open(AddAssetDialogComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addAsset(result);
      }
    });
  }

  addAsset(asset: Asset): void {
    this.assets = [...this.assets, {
      completionDate: asset.completionDate,
      assetType: asset.assetType,
      profitAtExit: asset.assetType === 'flip' ? asset.profitAtExit : null,
      cashflowPerMonth: asset.assetType !== 'flip' ? asset.cashflowPerMonth : null,
      propertyValue: asset.propertyValue,
      purchasePrice: asset.purchasePrice,
      cashLeftIn: asset.cashLeftIn,
      mortgage: asset.assetType !== 'flip' ? asset.mortgage : null,
      equity: asset.assetType !== 'flip' ? asset.equity : null
    }];
  }
}