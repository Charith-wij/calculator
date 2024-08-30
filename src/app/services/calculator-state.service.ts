import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { SetPropertyForm, SaveCalculation, CalculateFigures, SetSavedCalculations } from '../actions/calculator.actions';
import { CalculatedFigures, CalculatorForm } from '../models/calculator/calculator-form.model';
import { CalculatorState } from '../state/calculator-state';
import { SavedFiguresItem } from '../models/calculator/saved-figures-item.model';
import { LocalStorageService } from './local-storage-service';

@Injectable({
  providedIn: 'root'
})
export class CalculatorStateService {
  
  constructor(private store: Store, private readonly localStorageService: LocalStorageService) {}

  // Method to set the property form
  setPropertyForm(propertyForm: CalculatorForm) {
    this.store.dispatch(new SetPropertyForm(propertyForm));
  }

  // Method to save a calculation
  saveCalculation(calculation: SavedFiguresItem) {
    this.store.dispatch(new SaveCalculation(calculation));
  }

  setSavedCalculations(savedCalculations: SavedFiguresItem[]) {
    this.store.dispatch(new SetSavedCalculations(savedCalculations))
  }

  // Method to calculate figures
  calculateFigures(payload: any) {
    this.store.dispatch(new CalculateFigures(payload));
  }

  // Optionally, add methods to get current state values
  getCurrentPropertyForm(): Observable<CalculatorForm> {
    return this.store.select(CalculatorState.getPropertyForm);
  }

  getCurrentCalculatedFigures(): Observable<CalculatedFigures> {
    return this.store.select(CalculatorState.getCalculatedFigures);
  }

  getSavedCalculations(): Observable<SavedFiguresItem[]> {
    return this.store.select(CalculatorState.getSavedCalculations);
  }

  getSavedCalculationByAddress(address: string): SavedFiguresItem | null {
    return this.store.selectSnapshot(CalculatorState.getSavedCalculationByAddress(address));
  }
}
