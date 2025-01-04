import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ForecastLayoutComponent } from './components/forecast/main-layout/forecast-layout.component';
import { LayoutComponent } from './components/calculator/layout/calculator-layout.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forecast',
    component: ForecastLayoutComponent
  },
  {
    path: 'calculator',
    component: LayoutComponent
  },
  {
    path: 'saved-calculations',
    component: LayoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
