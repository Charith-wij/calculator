import { CalculatedFigures, CalculatorForm } from "./calculator-form.model";

export interface SavedItem {
    formData: CalculatorForm;
    figures: CalculatedFigures;
}