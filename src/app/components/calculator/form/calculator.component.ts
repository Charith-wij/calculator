import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, merge } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CalculatedFigures, CalculatorForm } from '../../../models/calculator/calculator-form.model';
import { FloorAreaService } from '../../../services/floor-area-service';
import { SavedItem } from '../../../models/calculator/saved-figures-item.model';
import { SaveCalculationDialogComponent } from '../save-calculation-dialog/save-calculation-dialog.component';
import { Store } from '@ngxs/store';
import { LoadSavedItemsFromLocalStorage, SaveItem } from '../../../actions/calculator.actions';
import { CalculatorState } from '../../../state/calculator-state';
import { GridItemStatus } from '../../../models/calculator/calculations-grid-item.model';
import { PdfExportService } from '../../../services/pdf-export.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit, OnDestroy {
  imageURL: string = ''
  propertyAddress: string = '';
  propertyForm!: FormGroup;
  formData!: CalculatorForm;
  figures!: CalculatedFigures;
  subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private store: Store,
    private pdfExportService: PdfExportService,
    private readonly floorAreaService: FloorAreaService) { }

  /**
   * Angular lifecycle - component initialisation
   */
  ngOnInit(): void {
    this.initialiseForm();
    this.setValueChangeListeners();
    this.subscriptions.add(this.store.select(CalculatorState.getActiveItem)
      .subscribe((savedItem) => {
        const formData = savedItem?.formData;
        if (typeof formData === 'object' && Object.keys(formData).length > 0) {
          this.propertyForm.patchValue(formData);
          this.propertyAddress = formData.metaData.address;
          this.imageURL = formData.metaData.imageUrl;
        }
      }));
    this.subscriptions.add(
      this.propertyForm.statusChanges.subscribe((status: string) => {
        if (status === 'VALID') {
          this.calculateFigures();
        }
      })
    );
    this.store.dispatch(new LoadSavedItemsFromLocalStorage());
    // this.floorAreaService.getFloorArea('B77 5QF', '43', 'Avill Hockley').subscribe(data => console.log(data));
    // this.floorAreaService.getFloorArea('le9 8fe', '15', 'byron street').subscribe(data => console.log(data));
  }

  /**
   * Angular lifecycle - component destruction
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async exportPdf(): Promise<void> {
    try {
      await this.pdfExportService.exportToPDF();
    } catch (error) {
      // Handle error (show toast, notification, etc.)
      console.error('Failed to export PDF:', error);
    }
  }

  /**
   * Adds the valueChange listeners for all the required form controls. Based the the value change events, 
   * the setter methods are called to calculate and set the values of the coumpound controls.
   */
  private setValueChangeListeners() {

    const monthlyRentChanged$ = this.propertyForm.get('BTLInformation.monthlyRent')?.valueChanges;
    const lettingAgentFeesChanged$ = this.propertyForm.get('BTLInformation.lettingAgentFee')?.valueChanges;
    const newMarketValue$ = this.propertyForm.get('BRRInformation.newMarketValue')?.valueChanges;
    const refinancedLTV$ = this.propertyForm.get('BRRInformation.refinancedLTV')?.valueChanges;
    const refinancingInterestRate$ = this.propertyForm.get('BRRInformation.refinancingInterestRate')?.valueChanges;
    const salePrice$ = this.propertyForm.get('BTSInformation.salePrice')?.valueChanges;
    const estateAgentFee$ = this.propertyForm.get('BTSInformation.estateAgentFee')?.valueChanges;

    // When Purchase Price Change
    this.subscriptions.add(
      this.propertyForm.get('purchaseInformation.purchasePrice')?.valueChanges
        .subscribe((value: number) => {
          this.propertyForm.get('purchaseInformation.stampDuty')?.setValue(this.getStampDuty(value));
          this.setDepositAndMortgageAmount();
        }));

    // When Deposi % Change
    this.subscriptions.add(
      this.propertyForm.get('borrowingInformation.depositPercentage')?.valueChanges
        .subscribe((value: number) => {
          this.propertyForm.get('borrowingInformation.mortgagePercentage')?.setValue(this.getMortgagePercentage(value));
          this.setDepositAndMortgageAmount();
          if (value == 100) {
            this.propertyForm.get('borrowingInformation.monthsOnBridging')?.setValue(0);
            this.propertyForm.get('borrowingInformation.mortgageFeePercentage')?.setValue(0);
            this.propertyForm.get('borrowingInformation.mortgageInterestRate')?.setValue(0);
          }
        }));

    // When Purchase Price Change
    this.subscriptions.add(
      this.propertyForm.get('borrowingInformation.mortgageFeePercentage')?.valueChanges
        .subscribe(() => this.setMortgageFeeAmount()));

    // When Interest % Change
    this.subscriptions.add(
      this.propertyForm.get('borrowingInformation.mortgageInterestRate')?.valueChanges
        .subscribe(() => this.setMortgageIntersetAmount()));

    // When Monthly Rent and Agent Fees Change
    if (monthlyRentChanged$ && lettingAgentFeesChanged$) {
      this.subscriptions.add(
        merge(monthlyRentChanged$, lettingAgentFeesChanged$)
          .subscribe(() => {
            this.setLettingAgentAmount();
          })
      );
    }
    //  When New Market Value and Refinanced LTV Changed
    this.subscriptions.add(newMarketValue$?.subscribe(() => {
      this.setRefinancedLTV();
      this.setRefinanceInterestAmount();
    }));
    this.subscriptions.add(refinancedLTV$?.subscribe(() => {
      this.setRefinancedLTV();
    }));

    this.subscriptions.add(
      this.propertyForm.get('BRRInformation.refinancingArrangementFee')?.valueChanges
        .subscribe(() => {
          this.setrefinanceFeeAmount();
          this.setRefinanceInterestAmount();
        }));

    // Calculate mortgage interest amount
    this.subscriptions.add(refinancingInterestRate$?.subscribe(() => {
      this.setRefinanceInterestAmount();
    }));

    // Calculate Estate Agent Fees
    if (salePrice$ && estateAgentFee$) {
      this.subscriptions.add(
        merge(salePrice$, estateAgentFee$)
          .subscribe(value => {
            this.estateAgentFees();
          })
      );
    }
  }

  /**
   * Create the Form instance. Form group and sub groups within the group is used for grouping the controls.
   */
  private initialiseForm() {
    this.propertyForm = this.fb.group({
      metaData: this.fb.group({
        address: [],
        guidePrice: [],
        rightmoveLink: [],
        auctionSiteLink: [],
        notes: []
      }),
      purchaseInformation: this.fb.group({
        purchasePrice: [],
        stampDuty: [],
        legalAndAuctionFees: [],
        refurbCost: []
      }),
      borrowingInformation: this.fb.group({
        depositPercentage: [],
        dipositAmount: [],
        mortgagePercentage: [],
        mortgageAmount: [],
        monthsOnBridging: [6],
        mortgageFeePercentage: [],
        mortgageFeeAmount: [0],
        mortgageInterestRate: [],
        mortgageInterestAmount: [0]
      }),
      BTLInformation: this.fb.group({
        monthlyRent: [],
        lettingAgentFee: [],
        lettingAgentFeeAmount: [],
        monthlyRunningCosts: []
      }),
      BRRInformation: this.fb.group({
        newMarketValue: [],
        refinancedLTV: [75],
        refinancedLTVAmount: [],
        refinancingArrangementFee: [],
        refinanceFeeAmount: [],
        refinancingInterestRate: [],
        refinanceInterestAmount: []
      }),
      BTSInformation: this.fb.group({
        salePrice: [],
        legalFeesBTS: [],
        estateAgentFee: [1],
        estateAgentFeeAmount: []
      })
    });
  }

  /**
   * Based on the form input values, this method calculate the figures and set those in the state model.
   */
  calculateFigures() {
    const values = this.propertyForm.value as CalculatorForm;
    this.formData = values;

    // Exit - BTL calculations
    const totalInvestmentCosts = Number(values.borrowingInformation.dipositAmount!) + Number(values.purchaseInformation.stampDuty) + Number(values.purchaseInformation.legalAndAuctionFees) + Number(values.purchaseInformation.refurbCost);
    const monthlyCashflow = Number(values.BTLInformation.monthlyRent) - (Number(values.BTLInformation.monthlyRunningCosts) + Number(values.BTLInformation.lettingAgentFee) + Number(values.borrowingInformation.mortgageInterestAmount!));
    const grossYield = ((Number(values.BTLInformation.monthlyRent) * 12) / Number(values.purchaseInformation.purchasePrice)) * 100;
    const netYield = (monthlyCashflow * 12 / Number(values.purchaseInformation.purchasePrice)) * 100;
    const roiBTL = (monthlyCashflow * 12 / totalInvestmentCosts) * 100;

    // Exit - BRR calculations
    const refinancingCashflow = Number(values.BTLInformation.monthlyRent) - (Number(values.BTLInformation.monthlyRunningCosts) + Number(values.BTLInformation.lettingAgentFee) + Number(values.BRRInformation.refinanceInterestAmount));
    const cashOutFromRefinancing = Number(values.BRRInformation.refinancedLTVAmount) - Number(values.borrowingInformation.mortgageAmount);
    const moneyLeftInDeal = totalInvestmentCosts - cashOutFromRefinancing;
    const monthsBeforeNoMoneyLeft = refinancingCashflow === 0 ? "Undefined" : moneyLeftInDeal / refinancingCashflow < 0 ? "None" : moneyLeftInDeal / refinancingCashflow;
    const returnOnInvestment = moneyLeftInDeal === 0 ? "Undefined" : (refinancingCashflow * 12) / moneyLeftInDeal < 0 ? "Infinite" : ((refinancingCashflow * 12) / moneyLeftInDeal) * 100;

    // Exit - BTS calculations
    const totalSellingCosts = (Number(values.borrowingInformation.mortgageInterestAmount) * Number(values.borrowingInformation.monthsOnBridging)) + Number(values.BTSInformation.legalFeesBTS) + Number(values.BTSInformation.estateAgentFeeAmount);
    const profitFromDeal = Number(values.BTSInformation.salePrice) - totalInvestmentCosts - Number(values.borrowingInformation.mortgageAmount) - Number(values.borrowingInformation.mortgageFeeAmount) - totalSellingCosts;
    const roiBTS = (profitFromDeal / totalInvestmentCosts) * 100;

    this.figures = {
      exitOptionBTL: {
        totalInvestmentCosts: Number(totalInvestmentCosts.toFixed(2)),
        monthlyCashflow: Number(monthlyCashflow.toFixed(2)),
        grossYield: Number(grossYield.toFixed(2)),
        netYield: Number(netYield.toFixed(2)),
        returnOnInvestment: Number(roiBTL.toFixed(2)),
      },
      exitOptionBRR: {
        refinancedMonthlyCashflow: Number(refinancingCashflow.toFixed(2)),
        cashOutFromRefinancing: Number(cashOutFromRefinancing.toFixed(2)),
        moneyLeftInDeal: Number(moneyLeftInDeal.toFixed(2)),
        monthsBeforeNoMoneyLeft: !Number.isNaN(Number(monthsBeforeNoMoneyLeft)) ? Number(Number(monthsBeforeNoMoneyLeft).toFixed(1)) : monthsBeforeNoMoneyLeft,
        returnOnInvestment: !Number.isNaN(Number(returnOnInvestment)) ? Number(Number(returnOnInvestment).toFixed(2)) : returnOnInvestment
      },
      exitOptionBTS: {
        totalInvestmentCosts: Number(totalInvestmentCosts.toFixed(2)),
        totalSellingCosts: Number(totalSellingCosts.toFixed(2)),
        profitFromDeal: Number(profitFromDeal.toFixed(2)),
        returnOnInvestment: Number(roiBTS.toFixed(2))
      }
    } as CalculatedFigures;
  }

  saveCalculation() {
    const itemToSave = { formData: this.formData, figures: this.figures } as SavedItem;
    const dialogRef = this.dialog.open(SaveCalculationDialogComponent, {
      width: '600px'
    });

    this.subscriptions.add(dialogRef.afterClosed().subscribe(result => {
      if (result) {
        itemToSave.formData.metaData = result;

        // TODO: below is an error the formData status is alwasy not set and we set it to newItem all the time
        itemToSave.formData.metaData.status = GridItemStatus.newItem;
        this.imageURL = itemToSave.formData.metaData.imageUrl;
        this.store.dispatch(new SaveItem(itemToSave));
      }
    }));
  }

  private getMortgagePercentage(depositPercentage: number): number | null {
    if (depositPercentage == null) {
      return null;
    }

    return 100 - depositPercentage;
  }

  private setDepositAndMortgageAmount() {
    let purchasePrice = this.propertyForm.get('purchaseInformation.purchasePrice')?.value;
    let depositPercentage = this.propertyForm.get('borrowingInformation.depositPercentage')?.value;
    let depositAmount = null;
    let mortgageAmount = null;

    if (purchasePrice != null && depositPercentage != null) {
      purchasePrice = Number(purchasePrice);
      depositPercentage = Number(depositPercentage);
      depositAmount = purchasePrice * depositPercentage / 100;
      mortgageAmount = purchasePrice - depositAmount;
    }

    this.propertyForm.get('borrowingInformation.dipositAmount')?.setValue(depositAmount);
    this.propertyForm.get('borrowingInformation.mortgageAmount')?.setValue(mortgageAmount);
    this.setMortgageFeeAmount();
    this.setMortgageIntersetAmount();
  }

  private setMortgageFeeAmount() {
    let mortgageFeePercentage = this.propertyForm.get('borrowingInformation.mortgageFeePercentage')?.value;
    let mortgageAmount = this.propertyForm.get('borrowingInformation.mortgageAmount')?.value;
    let mortgageFeeAmount = null;

    if (mortgageFeePercentage != null && mortgageAmount != null) {
      mortgageFeePercentage = Number(mortgageFeePercentage);
      mortgageAmount = Number(mortgageAmount);
      mortgageFeeAmount = mortgageAmount * mortgageFeePercentage / 100;
    }

    this.propertyForm.get('borrowingInformation.mortgageFeeAmount')?.setValue(mortgageFeeAmount);
  }

  private setMortgageIntersetAmount() {
    let mortgageInterestRate = this.propertyForm.get('borrowingInformation.mortgageInterestRate')?.value;
    let mortgageAmount = this.propertyForm.get('borrowingInformation.mortgageAmount')?.value;
    let mortgageInterestAmount = null;

    if (mortgageInterestRate != null && mortgageAmount != null) {
      mortgageInterestRate = Number(mortgageInterestRate);
      mortgageAmount = Number(mortgageAmount);
      mortgageInterestAmount = (mortgageAmount * mortgageInterestRate) / (12 * 100);
    }

    this.propertyForm.get('borrowingInformation.mortgageInterestAmount')?.setValue(mortgageInterestAmount);
  }

  private setLettingAgentAmount() {
    let monthlyRentChanged = this.propertyForm.get('BTLInformation.monthlyRent')?.value;
    let lettingAgentFeesChanged = this.propertyForm.get('BTLInformation.lettingAgentFee')?.value;
    let lettingAgentFeeAmount = null;

    if (monthlyRentChanged != null && lettingAgentFeesChanged != null) {
      lettingAgentFeeAmount = Number(monthlyRentChanged) * Number(lettingAgentFeesChanged) / 100;
    }
    this.propertyForm.get('BTLInformation.lettingAgentFeeAmount')?.setValue(lettingAgentFeeAmount);
  }

  private setRefinancedLTV() {
    let newMarketValue = this.propertyForm.get('BRRInformation.newMarketValue')?.value;
    let refinancedLTV = this.propertyForm.get('BRRInformation.refinancedLTV')?.value;
    let refinancedLTVAmount = null;

    if (newMarketValue != null && refinancedLTV != null) {
      refinancedLTVAmount = Number(newMarketValue) * Number(refinancedLTV) / 100;
    }
    this.propertyForm.get('BRRInformation.refinancedLTVAmount')?.setValue(refinancedLTVAmount);
  }

  private setrefinanceFeeAmount(): void {
    let refinancingArrangementFee = this.propertyForm.get('BRRInformation.refinancingArrangementFee')?.value;
    let refinancedLTVAmount = this.propertyForm.get('BRRInformation.refinancedLTVAmount')?.value;
    let refinanceFeeAmount = null;

    if (refinancingArrangementFee != null && refinancedLTVAmount != null) {
      refinanceFeeAmount = Number(refinancedLTVAmount) * Number(refinancingArrangementFee) / 100;
    }

    this.propertyForm.get('BRRInformation.refinanceFeeAmount')?.setValue(refinanceFeeAmount);
  }

  private setRefinanceInterestAmount() {
    let refinancedLTVAmount = this.propertyForm.get('BRRInformation.refinancedLTVAmount')?.value;
    let refinancingInterestRate = this.propertyForm.get('BRRInformation.refinancingInterestRate')?.value;
    let refinanceFeeAmount = this.propertyForm.get('BRRInformation.refinanceFeeAmount')?.value;
    let refinanceInterestAmount = null;

    if (refinancedLTVAmount != null && refinancingInterestRate != null) {
      refinanceInterestAmount = ((Number(refinancedLTVAmount) + Number(refinanceFeeAmount)) * (Number(refinancingInterestRate) / 100)) / 12;
    }

    this.propertyForm.get('BRRInformation.refinanceInterestAmount')?.setValue(refinanceInterestAmount);
  }

  private estateAgentFees() {
    let salePrice = this.propertyForm.get('BTSInformation.salePrice')?.value;
    let estateAgentFee = this.propertyForm.get('BTSInformation.estateAgentFee')?.value;
    let estataAgentFeeAmount = null;

    if (salePrice != null && estateAgentFee != null) {
      estataAgentFeeAmount = Number(salePrice) * Number(estateAgentFee) / 100;
    }

    this.propertyForm.get('BTSInformation.estateAgentFeeAmount')?.setValue(estataAgentFeeAmount);
  }

  private getStampDuty(purchasePrice: number): number {
    // Threasholds and rates
    const thresholds = [250000, 925000, 1500000];
    const rates = [0.05, 0.10, 0.15, 0.17];

    // Calculate the stamp duty
    let duty = 0;

    if (purchasePrice > thresholds[2]) {
      duty += (purchasePrice - thresholds[2]) * rates[3];
      purchasePrice = thresholds[2];
    }
    if (purchasePrice > thresholds[1]) {
      duty += (purchasePrice - thresholds[1]) * rates[2];
      purchasePrice = thresholds[1];
    }
    if (purchasePrice > thresholds[0]) {
      duty += (purchasePrice - thresholds[0]) * rates[1];
      purchasePrice = thresholds[0];
    }
    if (purchasePrice > 0) {
      duty += purchasePrice * rates[0];
    }

    return duty;
  }
}
