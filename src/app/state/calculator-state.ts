import { State, Action, StateContext, Selector } from '@ngxs/store';

import { CalculatedFigures, CalculatorForm } from '../models/calculator/calculator-form.model';
import { CalculatorStateModel } from '../models/calculator/calculator-state.model';
import { CalculateFigures, SaveCalculation, SetPropertyForm, SetSavedCalculations } from '../actions/calculator.actions';
import { SavedFiguresItem } from '../models/calculator/saved-figures-item.model';

@State<CalculatorStateModel>({
  name: 'calculator',
  defaults: {
    currentCalculatorFormData: {} as CalculatorForm, // TODO - I think we just need the activeSavedItemId
    calculatedResultFigures: {} as CalculatedFigures, // TODO - Check if we need this, we might just need the saved items list and the activeId
    savedCalculationsList: [] as SavedFiguresItem[]
  }
})
export class CalculatorState {

  @Selector()
  static getPropertyForm(state: CalculatorStateModel) {
    return state.currentCalculatorFormData;
  }

  @Selector()
  static getCalculatedFigures(state: CalculatorStateModel) {
    return state.calculatedResultFigures;
  }

  @Selector()
  static getSavedCalculations(state: CalculatorStateModel) {
    return state.savedCalculationsList;
  }

  static getSavedCalculationByAddress(address: string): (state: CalculatorStateModel) => SavedFiguresItem | null {
    return (state: any) => {
      return state.calculator.savedCalculationsList.find((item: SavedFiguresItem) => item.formData.metaData?.address === address) || null;
    };
  }

  @Action(SetSavedCalculations)
  setSavedCalculations(ctx: StateContext<CalculatorStateModel>, action: SetSavedCalculations) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      savedCalculationsList: action.payload
    });
  }

  @Action(SetPropertyForm)
  setPropertyForm(ctx: StateContext<CalculatorStateModel>, action: SetPropertyForm) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      currentCalculatorFormData: action.payload
    });
  }

  @Action(SaveCalculation)
  saveCalculation(ctx: StateContext<CalculatorStateModel>, action: SaveCalculation) {
    const state = ctx.getState();
    const index = state.savedCalculationsList.findIndex(item => item.formData.metaData.address.toLowerCase() === action.payload.formData.metaData.address.toLowerCase());
    let newSavedCalculationsList = state.savedCalculationsList;

    if (index !== -1) {
      // Item with the same id exists, replace it
      newSavedCalculationsList[index] = action.payload;
    } else {
      // Item doesn't exist, push it to the array
      newSavedCalculationsList = [...newSavedCalculationsList, action.payload];
    }
    ctx.setState({
      ...state,
      savedCalculationsList: newSavedCalculationsList
    });
  }

  @Action(CalculateFigures)
  calculateFigures(ctx: StateContext<CalculatorStateModel>, action: CalculateFigures) {
    // Perform calculation logic based on the payload
    const calculatedFigures = {} as CalculatedFigures; // Assume the calculation logic sets this up
    ctx.patchState({
      calculatedResultFigures: calculatedFigures
    });
  }
}