import { Component, OnInit } from '@angular/core';

import { CalculatorStateService } from '../../../services/calculator-state.service';
import { CalculatorForm } from '../../../models/calculator/calculator-form.model';
import { Observable, map } from 'rxjs';
import { CalculationsGridItem } from '../../../models/calculator/calculations-grid-item.model';
import { SavedFiguresItem } from '../../../models/calculator/saved-figures-item.model';
import { LocalStorageService } from '../../../services/local-storage-service';

@Component({
  selector: 'app-calculations-grid',
  templateUrl: './calculations-grid.component.html',
  styleUrls: ['./calculations-grid.component.scss']
})
export class CalculationsGridComponent implements OnInit {
  tableDataSource: CalculationsGridItem[] = [];

  displayedColumns: string[] = ['address', 'guidePrice', 'purchasePrice', 'auctionFees', 'refurbCost', 'MRV', 'profit', 'cashLeftIn', 'notes', 'remove'];

  constructor(
    private readonly calculatorStateService: CalculatorStateService,
    private readonly localStorageService: LocalStorageService) {
  }

  ngOnInit(): void {
    this.calculatorStateService.getSavedCalculations()
      .pipe(
        map((calculationFormItems: SavedFiguresItem[]) => this.mapGridData(calculationFormItems))
      )
      .subscribe(data => this.tableDataSource = data);
  }

  mapGridData(calculationFormItems: SavedFiguresItem[]): CalculationsGridItem[] {
    return calculationFormItems.map((item: SavedFiguresItem) => {
      return {
        address: item.formData.metaData?.address || '',
        guidePrice: item.formData.metaData?.guidePrice || 0,
        purchasePrice: item.formData.purchaseInformation.purchasePrice || 0,
        auctionFees: item.formData.purchaseInformation.legalAndAuctionFees || 0,
        refurbCost: item.formData.purchaseInformation.refurbCost || 0,
        MRV: item.formData.BRRInformation.newMarketValue || 0,
        profit: item.calculatdFigures.exitOptionBTS.profitFromDeal,
        cashLeftIn: item.calculatdFigures.exitOptionBRR.moneyLeftInDeal,
        notes: item.formData.metaData?.notes || ''
      };
    });
  }

  removeRow(index: number) {
    const itemToRemove = this.tableDataSource[index];
    this.localStorageService.removeItem('savedCalculations', itemToRemove.address);

    const savedCalculations = this.localStorageService.getItem('savedCalculations');

    if (savedCalculations.length > 0) {
      this.calculatorStateService.setSavedCalculations(savedCalculations);
    }
  }
  onRowClick(rowElement: CalculationsGridItem) {
    //  Find the calculation item from the address which is the uniqe property, create a state method for this
    const savedFiguresItem = this.calculatorStateService.getSavedCalculationByAddress(rowElement.address);
    this.calculatorStateService.setPropertyForm(savedFiguresItem!.formData);
  }
}
