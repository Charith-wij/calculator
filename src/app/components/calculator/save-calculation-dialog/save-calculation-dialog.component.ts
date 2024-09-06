import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';

import { MetaData } from '../../../models/calculator/calculator-form.model';
import { CalculatorState } from '../../../state/calculator-state';

@Component({
  selector: 'app-save-calculation-dialog',
  templateUrl: './save-calculation-dialog.component.html',
  styleUrls: ['./save-calculation-dialog.component.scss']
})
export class SaveCalculationDialogComponent implements OnInit, OnDestroy {
  saveCalculationForm: FormGroup;
  subscriptions: Subscription = new Subscription();

  constructor(public dialogRef: MatDialogRef<SaveCalculationDialogComponent>,
    private fb: FormBuilder,
    private store: Store) {
      this.saveCalculationForm = this.fb.group({
        address: ['', Validators.required],
        guidePrice: ['', Validators.required],
        rightmoveLink: [''],
        auctionSiteLink: [''],
        notes: ['']
      });
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.subscriptions.add(this.store.select(CalculatorState.getActiveItem)
      .subscribe((savedItem) => {
        const formData = savedItem?.formData;
        if (typeof formData === 'object' && Object.keys(formData).length > 0) {
          this.saveCalculationForm.setValue(formData.metaData);
        }
      }));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    const formValue = this.saveCalculationForm.value as MetaData;
    console.warn(formValue);
    this.dialogRef.close(formValue);
  }
}
