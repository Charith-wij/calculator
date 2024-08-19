import { Component, OnInit } from '@angular/core';

import { LocalStorageService } from '../../../services/local-storage-service';
import { CalculatorStateService } from '../../../services/calculator-state.service';

@Component({
  selector: 'app-calculator-layout',
  templateUrl: './calculator-layout.component.html',
  styleUrls: ['./calculator-layout.component.scss']
})
export class LayoutComponent implements OnInit {
  constructor(private readonly localStorageService: LocalStorageService,
    private readonly calculatorStateService: CalculatorStateService,) {
  }

  ngOnInit(): void {
    this.initialiseState();
  }

  initialiseState() {
    const savedCalculations = this.localStorageService.getItem('savedCalculations');

    if (savedCalculations.length > 0) {
      this.calculatorStateService.setSavedCalculations(savedCalculations);
    }
  }
}
