import { StateModel } from "../models/forecast/forecast-state.model";

export class SetBankBalance {
  static readonly type = '[State] Set Bank Balance';
  constructor(public payload: number) { }
}

export class SetCashflow {
  static readonly type = '[State] Set Cashflow';
  constructor(public payload: number) { }
}

export class SetEquity {
  static readonly type = '[State] Set Equity';
  constructor(public payload: number) { }
}

export class SetMortgage {
  static readonly type = '[State] Set Mortgage';
  constructor(public payload: number) { }
}

export class ResetState {
  static readonly type = '[State] Reset State';
}

export class SetState {
  constructor(public payload: StateModel) { }
  static readonly type = '[State] Set State';
}