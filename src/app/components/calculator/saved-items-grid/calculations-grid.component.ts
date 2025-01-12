import { Component, OnInit } from '@angular/core';

import { map } from 'rxjs';
import { CalculationsGridItem, GridItemStatus } from '../../../models/calculator/calculations-grid-item.model';
import { SavedItem } from '../../../models/calculator/saved-figures-item.model';
import { Store } from '@ngxs/store';
import { CalculatorState } from '../../../state/calculator-state';
import { SetActiveItemIdInState, RemoveItem, UpdateStatus } from 'src/app/actions/calculator.actions';
import { TabManagerService } from '../../../services/tab-manager.service';

@Component({
  selector: 'app-calculations-grid',
  templateUrl: './calculations-grid.component.html',
  styleUrls: ['./calculations-grid.component.scss']
})
export class CalculationsGridComponent implements OnInit {
  tableDataSource: CalculationsGridItem[] = [];
  filteredTableDataSource: CalculationsGridItem[] = [];

  displayedColumns: string[] = ['address', 'guidePrice', 'purchasePrice', 'auctionFees', 'refurbCost', 'MRV', 'profit', 'cashLeftIn', 'notes', 'status', 'remove'];
  statuses: string[] = ['New', 'Active', 'Expired'];

  constructor(
    private store: Store,
    private tabManagerService: TabManagerService) {
  }

  ngOnInit(): void {
    this.store.select(CalculatorState.getSavedItems)
      .pipe(
        map((calculationFormItems: SavedItem[]) => this.mapGridData(calculationFormItems))
      )
      .subscribe(data => {
        this.tableDataSource = data;
        this.filteredTableDataSource = this.tableDataSource;
      });
  }

  onStartNewClculation() {
    this.store.dispatch(new SetActiveItemIdInState(''));
    this.tabManagerService.setActiveTab(2);
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
        notes: item.formData.metaData?.notes || '',
        status: item.formData.metaData?.status
      };
    });
  }

  removeRow(index: number, event: any) {
    const itemToRemove = this.tableDataSource[index];

    if (itemToRemove != null) {
      this.store.dispatch(new RemoveItem(itemToRemove.address));
    }
    // event.stopPropergation();
    event.preventDefault();
  }

  onRowClick(rowElement: CalculationsGridItem) {
    this.store.dispatch(new SetActiveItemIdInState(rowElement.address));
    this.tabManagerService.setActiveTab(2);
  }

  onStatusChange(element: CalculationsGridItem): void {
    this.store.dispatch(new UpdateStatus(element.address, element.status));
  }

  onFilterStatusChange(selectedStatus: string): void {
    if (!selectedStatus) {
      this.filteredTableDataSource = this.tableDataSource;
    } else {
      this.filteredTableDataSource = this.tableDataSource.filter(item => item.status === selectedStatus);
    }
  }


  // Function to return color based on status
  getStatusColor(status: string): string {
    switch (status) {
      case 'New':
        return 'black';
      case 'Active':
        return 'orange';
      case 'Expired':
        return 'red';
      default:
        return 'black';
    }
  }
}
