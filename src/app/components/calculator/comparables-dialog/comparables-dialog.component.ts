// comparables-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ComparableItem } from '../../../models/calculator/calculator-form.model';

@Component({
  selector: 'app-comparables-dialog',
  templateUrl: './comparables-dialog.component.html',
 styleUrls: ['./comparables-dialog.component.scss']
})
export class ComparablesDialogComponent implements OnInit {
  dialogForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ComparablesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.dialogForm = this.fb.group({
      floorArea: ['', Validators.required],
      comparables: this.fb.array([])
    });
  }

  get comparables(): FormArray {
    return this.dialogForm.get('comparables') as FormArray<FormGroup<{[key in keyof ComparableItem]: FormControl}>>;
  }

  ngOnInit() {
    // Initialize form with existing data if any
    if (this.data?.comparables?.length) {
      const comparablesArray = this.dialogForm.get('comparables') as FormArray;
      this.data.comparables.forEach((comparable: ComparableItem) => {
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
    if(this.data.floorArea != null) {
      this.dialogForm.get('floorArea')?.setValue(this.data.floorArea);
    }
  }

  createComparable(): FormGroup {
    return this.fb.group({
      propertyAddress: [''],
      salePrice: [''],
      bedsBaths: [''],
      condition: [''],
      sqMetre: [''],
      pricePerSqm: [''],
      link: ['']
    });
  }

  addComparable(): void {
    this.comparables.push(this.createComparable());
  }

  removeComparable(index: number): void {
    this.comparables.removeAt(index);
  }

  calculatePricePerSqm(index: number): void {
    const comparable = this.comparables.at(index);
    const salePrice = comparable.get('salePrice')?.value;
    const sqMetre = comparable.get('sqMetre')?.value;
    
    if (salePrice && sqMetre && sqMetre !== 0) {
      const pricePerSqm = salePrice / sqMetre;
      comparable.patchValue({ pricePerSqm: pricePerSqm.toFixed(2) });
    }
  }

  calculateAndSave(): void {
    if (this.dialogForm.get('floorArea')?.invalid) {
      alert('Please enter the floor area of your property');
      return;
    }

    const comparablesArray = this.comparables.value;
    if (comparablesArray.length > 0) {
      const totalPricePerSqm = comparablesArray.reduce((sum: number, comparable: ComparableItem) => {
        return sum + (parseFloat(comparable.pricePerSqm as any) || 0);
      }, 0);
      
      const averagePrice = totalPricePerSqm / comparablesArray.length;
      
      this.dialogRef.close({
        comparables: comparablesArray,
        averagePricePerSqm: averagePrice.toFixed(2),
        floorArea: this.dialogForm.get('floorArea')?.value
      });
    }
  }
}