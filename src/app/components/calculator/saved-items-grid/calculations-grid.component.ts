import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs';
import { CalculationsGridItem } from '../../../models/calculator/calculations-grid-item.model';
import { SavedItem } from '../../../models/calculator/saved-figures-item.model';
import { LocalStorageService } from '../../../services/local-storage-service';
import { Store } from '@ngxs/store';
import { CalculatorState } from '../../../state/calculator-state';
import { LoadItem, RemoveItem } from 'src/app/actions/calculator.actions';

@Component({
  selector: 'app-calculations-grid',
  templateUrl: './calculations-grid.component.html',
  styleUrls: ['./calculations-grid.component.scss']
})
export class CalculationsGridComponent implements OnInit {
  tableDataSource: CalculationsGridItem[] = [];

  displayedColumns: string[] = ['address', 'guidePrice', 'purchasePrice', 'auctionFees', 'refurbCost', 'MRV', 'profit', 'cashLeftIn', 'notes', 'remove'];

  constructor(
    private store: Store,
    private readonly localStorageService: LocalStorageService) {
  }

  ngOnInit(): void {
    this.store.select(CalculatorState.getSavedItems)
      .pipe(
        map((calculationFormItems: SavedItem[]) => this.mapGridData(calculationFormItems))
      )
      .subscribe(data => this.tableDataSource = data);
  }

  mapGridData(calculationFormItems: SavedItem[]): CalculationsGridItem[] {
    return calculationFormItems.map((item: SavedItem) => {
      return {
        address: item.formData.metaData?.address || '',
        guidePrice: item.formData.metaData?.guidePrice || 0,
        purchasePrice: item.formData.purchaseInformation.purchasePrice || 0,
        auctionFees: item.formData.purchaseInformation.legalAndAuctionFees || 0,
        refurbCost: item.formData.purchaseInformation.refurbCost || 0,
        MRV: item.formData.BRRInformation.newMarketValue || 0,
        profit: item.figures.exitOptionBTS.profitFromDeal,
        cashLeftIn: item.figures.exitOptionBRR.moneyLeftInDeal,
        notes: item.formData.metaData?.notes || ''
      };
    });
  }

  removeRow(index: number, event: any) {
    const itemToRemove = this.tableDataSource[index];

    if (itemToRemove != null) {
      this.store.dispatch(new RemoveItem(itemToRemove.address));
    }
    event.stopPropergation();
    event.preventDefault();
  }

  onRowClick(rowElement: CalculationsGridItem) {
    this.store.dispatch(new LoadItem(rowElement.address));
  }
}
