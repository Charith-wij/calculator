import { CalculatorForm, CalculatedFigures } from "./calculator-form.model";
import { SavedItem } from "./saved-figures-item.model";

export interface CalculatorStateModel {
    activeItemId: string | null;
    savedItems: SavedItem[];
  }