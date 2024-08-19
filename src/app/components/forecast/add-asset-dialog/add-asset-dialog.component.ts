import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Asset } from '../../../models/forecast/asset.model';
import { ForecasterStateService } from 'src/app/services/forecaster-state.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-add-asset-dialog',
  templateUrl: './add-asset-dialog.component.html',
  styleUrls: ['./add-asset-dialog.component.scss']
})
export class AddAssetDialogComponent {
  assetForm: FormGroup;
  assetType: string = '';

  constructor(
    public dialogRef: MatDialogRef<AddAssetDialogComponent>,
    private stateervice: ForecasterStateService,
    private fb: FormBuilder) {

    this.assetForm = this.fb.group({
      completionDate: [''],
      assetType: ['', Validators.required],
      profitAtExit: [''],
      propertyValue: [''],
      purchasePrice: [''],
      mortgage: [''],
      equity: [''],
      cashLeftIn: [''],
      cashflowPerMonth: ['']
    });
  }

  ngOnInit(): void {
    this.assetForm.get('propertyValue')?.valueChanges.subscribe(propertyValue => {
      if (this.assetForm.get('assetType')?.value !== 'flip') {
        const mortgage = Number(propertyValue) * 0.75;
        const equity = Number(propertyValue) - mortgage;
        this.assetForm.get('mortgage')?.setValue(mortgage);
        this.assetForm.get('equity')?.setValue(equity);
      }
    });
  }

  onAssetTypeChange(event: any): void {
    this.assetType = event.value;
    if (this.assetType === 'flip') {
      this.assetForm.get('profitAtExit')!.setValidators([Validators.required]);
      this.assetForm.get('cashLeftIn')!.clearValidators();
      this.assetForm.get('cashflowPerMonth')!.clearValidators();
    } else {
      this.assetForm.get('profitAtExit')!.clearValidators();
      this.assetForm.get('cashLeftIn')!.setValidators([Validators.required]);
      this.assetForm.get('cashflowPerMonth')!.setValidators([Validators.required]);
    }
    this.assetForm.get('profitAtExit')!.updateValueAndValidity();
    this.assetForm.get('cashLeftIn')!.updateValueAndValidity();
    this.assetForm.get('cashflowPerMonth')!.updateValueAndValidity();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onAddClick(): void {
    const formValue = this.assetForm.value as Asset;
    console.warn(formValue);

    if (formValue.assetType === 'flip') {
      this.stateervice.updateBankBalance(Number(formValue.profitAtExit));
    }
    else {
      this.stateervice.updateCashflow(Number(formValue.cashflowPerMonth));
      this.stateervice.updateBankBalance(Number(formValue.cashLeftIn) * -1);
      this.stateervice.updateMortgage(Number(formValue.mortgage));
      this.stateervice.updateEquity(Number(formValue.equity));
    }

    this.dialogRef.close(this.assetForm.value);
  }
}