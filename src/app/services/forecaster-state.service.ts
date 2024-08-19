import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { ResetState, SetBankBalance, SetCashflow, SetEquity, SetMortgage, SetState } from '../actions/state.actions';
import { ForecastState } from '../state/state';
import { StateModel } from '../models/forecast/forecast-state.model';

@Injectable({
  providedIn: 'root'
})
export class ForecasterStateService {
  constructor(private store: Store) {}

  resetState() {
    this.store.dispatch(new ResetState());
  }
  
  getBankBalance(): Observable<number> {
    return this.store.select(ForecastState.getBankBalance);
  }

  getCashflow(): Observable<number> {
    return this.store.select(ForecastState.getCashflow);
  }

  getEquity(): Observable<number> {
    return this.store.select(ForecastState.getEquity);
  }

  getMortgage(): Observable<number> {
    return this.store.select(ForecastState.getMortgage);
  }

  getState(): Observable<StateModel> {
    return this.store.select(ForecastState.getCompleteState);
  }

  setBankBalance(bankBalance: number) {
    this.store.dispatch(new SetBankBalance(bankBalance));
  }

  setCashflow(cashflow: number) {
    this.store.dispatch(new SetCashflow(cashflow));
  }

  setEquity(equity: number) {
    this.store.dispatch(new SetEquity(equity));
  }

  setMortgage(mortgage: number) {
    this.store.dispatch(new SetMortgage(mortgage));
  }

  setState(state: StateModel) {
    this.store.dispatch(new SetState(state));
  }

  // Custom methods
  updateBankBalance(balance: number) {
    this.getBankBalance()
      .pipe(take(1))
      .subscribe((currentBalance: number) => {
        const newBalance = currentBalance + balance;
        this.setBankBalance(newBalance);
      });
  }

  updateCashflow(value: number) {
    this.getCashflow()
      .pipe(take(1))
      .subscribe((currentCashflow: number) => {
        const newCashflow = currentCashflow + value;
        this.setCashflow(newCashflow);
      });
  }

  updateMortgage(value: number) {
    this.getMortgage()
      .pipe(take(1))
      .subscribe((currentMortgage: number) => {
        const newMortgage = currentMortgage + value;
        this.setMortgage(newMortgage);
      });
  }

  updateEquity(value: number) {
    this.getEquity()
      .pipe(take(1))
      .subscribe((currentEquity: number) => {
        const newEquity = currentEquity + value;
        this.setEquity(newEquity);
      });
  }
}