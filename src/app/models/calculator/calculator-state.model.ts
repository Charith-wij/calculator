import { CalculatorForm, CalculatedFigures } from "./calculator-form.model";
import { SavedFiguresItem } from "./saved-figures-item.model";

export interface CalculatorStateModel {
    currentCalculatorFormData: CalculatorForm;
    calculatedResultFigures: CalculatedFigures;
    savedCalculationsList: SavedFiguresItem[];
  }