import { CalculatorForm } from "../models/calculator/calculator-form.model";
import { SavedItem } from "../models/calculator/saved-figures-item.model";

export class SaveItem {
  static readonly type = '[Calculator] Save Calculation';
  constructor(public payload: SavedItem) { }
}

export class LoadSavedItemsFromLocalStorage {
  static readonly type = '[Calculator] Load Saved Items From Local Storage';
  constructor() { }
}

export class LoadItem {
  static readonly type = '[Calculator] Load Item From State';
  constructor(public payload: string) { }
}
