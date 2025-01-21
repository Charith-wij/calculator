import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ForecastLayoutComponent } from './components/forecast/main-layout/forecast-layout.component';
import { LayoutComponent } from './components/calculator/layout/calculator-layout.component';
import { LoginComponent } from './components/login/login.component';
import { LoadSharedPropertyComponent } from './components/calculator/load-shared-property/load-shared-property.component';
import { AuthGuard } from './guards/auth.guard';
import { SavedItemsResolver } from './resolvers/saved-items.resolver';



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
    component: ForecastLayoutComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    resolve: {
      savedItems: SavedItemsResolver
    },
    children:[
      {
        path: 'calculator',
        component: LayoutComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'load-property/:shareId',
        component: LoadSharedPropertyComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
