import { CalculatorForm } from "../models/calculator/calculator-form.model";
import { SavedFiguresItem } from "../models/calculator/saved-figures-item.model";

export class SetPropertyForm {
  static readonly type = '[Calculator] Set Property Form';
  constructor(public payload: CalculatorForm) { }
}

export class SetSavedCalculations {
  static readonly type = '[Calculator] Set Saved Calculations';
  constructor(public payload: SavedFiguresItem[]) { }
}

export class SaveCalculation {
  static readonly type = '[Calculator] Save Calculation';
  constructor(public payload: SavedFiguresItem) { }
}

export class CalculateFigures {
  static readonly type = '[Calculator] Calculate Figures';
  constructor(public payload: any) { }  // Define your payload structure based on your requirements.
}
