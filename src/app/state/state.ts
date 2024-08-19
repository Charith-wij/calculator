import { State, Action, StateContext, Selector } from '@ngxs/store';
import { StateModel } from '../models/forecast/forecast-state.model';

import { ResetState, SetBankBalance, SetCashflow, SetEquity, SetMortgage, SetState } from '../actions/state.actions';

const defaults: StateModel = {
  bankBalance: 0,
  cashflow: 0,
  equity: 0,
  mortgage: 0,
  inialBankBalance: 0,
  initialCashflow: 0
};

@State<StateModel>({
  name: 'state',
  defaults: defaults
})
export class ForecastState {
  @Selector()
  static getBankBalance(state: StateModel) {
    return state.bankBalance;
  }

  @Selector()
  static getCashflow(state: StateModel) {
    return state.cashflow;
  }

  @Selector()
  static getEquity(state: StateModel) {
    return state.equity;
  }

  @Selector()
  static getMortgage(state: StateModel) {
    return state.mortgage;
  }

  @Selector()
  static getCompleteState(state: StateModel) {
    return state;
  }

  @Action(SetBankBalance)
  setBankBalance(ctx: StateContext<StateModel>, action: SetBankBalance) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      bankBalance: action.payload
    });
  }

  @Action(SetCashflow)
  setCashflow(ctx: StateContext<StateModel>, action: SetCashflow) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      cashflow: action.payload
    });
  }

  @Action(SetEquity)
  setEquity(ctx: StateContext<StateModel>, action: SetEquity) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      equity: action.payload
    });
  }

  @Action(SetMortgage)
  setMortgage(ctx: StateContext<StateModel>, action: SetMortgage) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      mortgage: action.payload
    });
  }

  @Action(SetState)
  setCompleteState(ctx: StateContext<StateModel>, action: SetState) {
    const state = ctx.getState();
    ctx.setState(action.payload);
  }

  @Action(ResetState)
  resetState(ctx: StateContext<StateModel>) {
    ctx.setState(defaults);
  }
}