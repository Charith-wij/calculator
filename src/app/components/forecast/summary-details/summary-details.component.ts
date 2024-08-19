import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ForecasterStateService } from 'src/app/services/forecaster-state.service';

@Component({
  selector: 'app-summary-details',
  templateUrl: './summary-details.component.html',
  styleUrls: ['./summary-details.component.scss']
})
export class SummaryDetailsComponent {
  bankBalanceControl = new FormControl(0);
  cashflowControl = new FormControl(0);

  constructor(public stateService: ForecasterStateService) {
    this.bankBalanceControl.valueChanges.subscribe(value => {
      stateService.setBankBalance(Number(value!));
    });
    this.cashflowControl.valueChanges.subscribe(value => {
      stateService.setCashflow(Number(value!));
    })
  }
}
