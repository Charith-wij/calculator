import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ForecastLayoutComponent } from './components/forecast/main-layout/forecast-layout.component';
import { CalculatorComponent } from './components/calculator/form/calculator.component';
import { LayoutComponent } from './components/calculator/layout/calculator-layout.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'forecast',
    pathMatch: 'full'
  },
  {
    path: 'forecast',
    component: ForecastLayoutComponent
  },
  {
    path: 'calculator',
    component: LayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
