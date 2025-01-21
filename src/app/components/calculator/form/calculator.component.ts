import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, merge } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { CalculatedFigures, CalculatorForm, ComparableItem } from '../../../models/calculator/calculator-form.model';
import { FloorAreaService } from '../../../services/floor-area-service';
import { SavedItem } from '../../../models/calculator/saved-figures-item.model';
import { SaveCalculationDialogComponent } from '../save-calculation-dialog/save-calculation-dialog.component';
import { Store } from '@ngxs/store';
import { LoadSavedItemsFromLocalStorage, SaveItem } from '../../../actions/calculator.actions';
import { CalculatorState } from '../../../state/calculator-state';
import { GridItemStatus } from '../../../models/calculator/calculations-grid-item.model';
import { PdfExportService } from '../../../services/pdf-export.service';
import { PropertyFormInitialValues } from '../../../models/calculator/form-values.interface';
import { ComparablesDialogComponent } from '../comparables-dialog/comparables-dialog.component';
import { PropertySharingService } from '../../../services/property-sharing.service';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';
import { Router } from '@angular/router';

// Define initial values
const PROPERTY_FORM_INITIAL_VALUES: PropertyFormInitialValues = {
  metaData: {
    address: '',
    guidePrice: null,
    floorArea: null,
    rightmoveLink: '',
    auctionSiteLink: '',
    notes: '',
    status: GridItemStatus.newItem
  },
  purchaseInformation: {
    purchasePrice: "",
    stampDuty: null,
    legalAndAuctionFees: 4500,
    refurbCost: ""
  },
  borrowingInformation: {
    depositPercentage: 25,
    dipositAmount: null,
    mortgagePercentage: 75,
    mortgageAmount: null,
    monthsOnBridging: 9,
    mortgageFeePercentage: 2,
    mortgageFeeAmount: null,
    mortgageInterestRate: 12,
    mortgageInterestAmount: null
  },
  comparables: [],
  BTLInformation: {
    monthlyRent: "",
    lettingAgentFee: 0,
    lettingAgentFeeAmount: null,
    monthlyRunningCosts: 50
  },
  BRRInformation: {
    newMarketValue: null,
    refinancedLTV: 75,
    refinancedLTVAmount: null,
    refinancingArrangementFee: 2,
    refinanceFeeAmount: null,
    refinancingInterestRate: 5.3,
    refinanceInterestAmount: null
  },
  BTSInformation: {
    salePrice: null,
    legalFeesBTS: 1500,
    estateAgentFee: 1,
    estateAgentFeeAmount: null
  }
};

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit, OnDestroy {
  imageURL: string = ''
  propertyAddress: string = '';
  averagePricePerSqm: number = -1;
  propertyForm!: FormGroup;
  formData!: CalculatorForm;
  figures!: CalculatedFigures;
  subscriptions: Subscription = new Subscription();
  modal: any;
  loadSharedPropertyData: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private store: Store,
    private router: Router,
    private pdfExportService: PdfExportService,
    private sharingService: PropertySharingService,
    private readonly floorAreaService: FloorAreaService) {

      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state as { propertyData: any };
     
      if (state?.propertyData) {
        console.log('Received shared property data:', state.propertyData);
        this.loadSharedPropertyData = state.propertyData;
      }
      
  }

  get comparables(): FormArray {
    return this.propertyForm.get('comparables') as FormArray;
  }

  /**
   * Angular lifecycle - component initialisation
   */
  ngOnInit(): void {
    this.initialiseForm();

    if (this.loadSharedPropertyData != null) {
      this.calculateFigures();
      this.updatePageWithActiveItemData(this.loadSharedPropertyData);
    }

    this.setValueChangeListeners();
    this.subscriptions.add(this.store.select(CalculatorState.getActiveItem)
      .subscribe((activeItemData) => {
        this.updatePageWithActiveItemData(activeItemData);
      }));
    this.subscriptions.add(
      this.propertyForm.statusChanges.subscribe((status: string) => {
        if (status === 'VALID') {
          this.calculateFigures();
        }
      })
    );
    
    // this.floorAreaService.getFloorArea('B77 5QF', '43', 'Avill Hockley').subscribe(data => console.log(data));
    // this.floorAreaService.getFloorArea('le9 8fe', '15', 'byron street').subscribe(data => console.log(data));
  }

  private updatePageWithActiveItemData(activeItemData: SavedItem | undefined){
    if (activeItemData == null) {
      this.resetFormAndCalculationData();
      this.focusOnPurchasePrice();
      this.updateComparables([]);
    }

    const formData = activeItemData?.formData;

    if (typeof formData === 'object' && Object.keys(formData).length > 0) {
      this.propertyForm.patchValue(formData);
      this.updateComparables(formData.comparables);
      this.propertyAddress = formData.metaData.address;
      this.imageURL = formData.metaData.imageUrl;
    }
  }

  async shareCalculation() {
    try {
      const itemToShare = this.store.selectSnapshot(CalculatorState.getActiveItem) as SavedItem;

      // Generate share link
      const shareLink = await this.sharingService.shareProperty(itemToShare);

      this.openShareDialog(shareLink);
    } 
    catch (error) {
      console.error('Error sharing property:', error);
    }
  }

  openShareDialog(shareLink: string) {
    // Create a dialog showing the share link and copy button
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      data: { shareLink }
    });
  }

  openComparablesDialog(): void {
    const dialogRef = this.dialog.open(ComparablesDialogComponent, {
      data: {
        comparables: this.propertyForm.get('comparables')?.value || [],
        floorArea: this.propertyForm.get('metaData.floorArea')?.value
      },
      disableClose: false,
      maxWidth: '1250px',
      maxHeight: '100vh',
      height: 'auto',
      width: '95%',
      autoFocus: false,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateComparables(result.comparables);
        this.averagePricePerSqm = Number(result.averagePricePerSqm);
        const floorArea = Number(result.floorArea);

        if (this.averagePricePerSqm > 0 && floorArea > 0) {
          this.propertyForm.get('BRRInformation.newMarketValue')?.setValue(this.averagePricePerSqm * floorArea);
          this.propertyForm.get('BTSInformation.salePrice')?.setValue(this.averagePricePerSqm * floorArea);
          this.propertyForm.get('metaData.floorArea')?.setValue(floorArea);
        }
      }
    });
  }

  /**
   * Angular lifecycle - component destruction
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  isPurchasePriceInvalid(): boolean | null {
    const control = this.propertyForm.get('purchaseInformation.purchasePrice');

    return control && control.invalid; //&& control.touched
  }

  isRefurbCostInvalid(): boolean | null {
    const control = this.propertyForm.get('purchaseInformation.refurbCost');

    return control && control.invalid; //&& control.touched
  }

  isMonthlyRentInvalid(): boolean | null {
    const control = this.propertyForm.get('BTLInformation.monthlyRent');

    return control && control.invalid; //&& control.touched
  }

  isNewMarketValueInvalid(): boolean | null {
    const control = this.propertyForm.get('BRRInformation.newMarketValue');

    return control && control.invalid; //&& control.touched
  }

  isSalePriceInvalid(): boolean | null {
    const control = this.propertyForm.get('BTSInformation.salePrice');

    return control && control.invalid; //&& control.touched
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
      this.setrefinanceFeeAmount();
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
      metaData: this.fb.group(PROPERTY_FORM_INITIAL_VALUES.metaData),
      purchaseInformation: this.fb.group(PROPERTY_FORM_INITIAL_VALUES.purchaseInformation),
      borrowingInformation: this.fb.group(PROPERTY_FORM_INITIAL_VALUES.borrowingInformation),
      comparables: this.fb.array(PROPERTY_FORM_INITIAL_VALUES.comparables),
      BTLInformation: this.fb.group(PROPERTY_FORM_INITIAL_VALUES.BTLInformation),
      BRRInformation: this.fb.group(PROPERTY_FORM_INITIAL_VALUES.BRRInformation),
      BTSInformation: this.fb.group(PROPERTY_FORM_INITIAL_VALUES.BTSInformation)
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
        itemToSave.formData.metaData = {
          ...itemToSave.formData.metaData,
          ...result
        };

        // TODO: below is an error the formData status is alwasy not set and we set it to newItem all the time
        // itemToSave.formData.metaData.status = GridItemStatus.newItem;
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

  private resetFormAndCalculationData() {
    this.propertyForm.reset(PROPERTY_FORM_INITIAL_VALUES);
    this.propertyForm.markAsPristine();
    this.propertyForm.markAsUntouched();
    this.propertyAddress = '';
    this.imageURL = '';
  }

  private focusOnPurchasePrice() {
    setTimeout(() => {
      const firstControl = 'purchasePrice';
      const parentGroup = 'purchaseInformation';
      const element = document.querySelector(`[formGroupName="${parentGroup}"] [formControlName="${firstControl}"]`) as HTMLElement;
      element?.focus();
    });
  }

  private updateComparables(comparables: ComparableItem[]): void {
    const comparablesArray = this.propertyForm.get('comparables') as FormArray;

    // Clear existing values
    while (comparablesArray.length) {
      comparablesArray.removeAt(0);
    }

    if (comparables == null) {

      return;
    }

    // Add new values
    comparables.forEach(comparable => {
      comparablesArray.push(
        this.fb.group({
          propertyAddress: [comparable.propertyAddress],
          salePrice: [comparable.salePrice],
          bedsBaths: [comparable.bedsBaths],
          condition: [comparable.condition],
          sqMetre: [comparable.sqMetre],
          pricePerSqm: [comparable.pricePerSqm],
          link: [comparable.link]
        })
      );
    });
  }

  private initializeFormWithData(data: any) {
    // Update your form with the received data
    this.propertyForm.patchValue(data);
  }

}
