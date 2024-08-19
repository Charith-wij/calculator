import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { MetaData } from '../../../models/calculator/calculator-form.model';

@Component({
  selector: 'app-save-calculation-dialog',
  templateUrl: './save-calculation-dialog.component.html',
  styleUrls: ['./save-calculation-dialog.component.scss']
})
export class SaveCalculationDialogComponent {
  saveCalculationForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<SaveCalculationDialogComponent>,
    private fb: FormBuilder) {
      this.saveCalculationForm = this.fb.group({
        address: ['', Validators.required],
        guidePrice: ['', Validators.required],
        rightmoveLink: [''],
        auctionSiteLink: [''],
        notes: ['']
      });
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
