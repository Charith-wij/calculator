import { GridItemStatus } from "../models/calculator/calculations-grid-item.model";
import { CalculatorForm } from "../models/calculator/calculator-form.model";
import { SavedItem } from "../models/calculator/saved-figures-item.model";

export class SaveItem {
  static readonly type = '[Calculator] Save Item';
  constructor(public payload: SavedItem) { }
}

export class LoadSavedItemsFromLocalStorage {
  static readonly type = '[Calculator] Load Saved Items From Local Storage';
  constructor() { }
}

export class SetActiveItemIdInState {
  static readonly type = '[Calculator] Load Item From State';
  constructor(public payload: string) { }
}

export class RemoveItem {
  static readonly type = '[Calculator] Remove Item';
  constructor(public payload: string) { }
}

export class UpdateStatus {
  static readonly type = '[Calculator] Update Item';
  constructor(public address: string, public status: GridItemStatus) { }
}
