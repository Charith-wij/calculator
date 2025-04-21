import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ForecastLayoutComponent } from './components/forecast/main-layout/forecast-layout.component';
import { AssetGridComponent } from './components/forecast/asset-grid/asset-grid.component';
import { SummaryDetailsComponent } from './components/forecast/summary-details/summary-details.component';
import { AddAssetDialogComponent } from './components/forecast/add-asset-dialog/add-asset-dialog.component';
import { ForecastState } from './state/state';
import { AssetGroupsComponent } from './components/forecast/asset-groups/asset-groups.component';
import { CalculatorComponent } from './components/calculator/form/calculator.component';
import { CalculatorState } from './state/calculator-state';
import { CalculationsGridComponent } from './components/calculator/saved-items-grid/calculations-grid.component';
import { LayoutComponent } from './components/calculator/layout/calculator-layout.component';
import { SaveCalculationDialogComponent } from './components/calculator/save-calculation-dialog/save-calculation-dialog.component';
import { GridFilterComponent } from './components/calculator/grid-filter/grid-filter.component';
import { CustomInputComponent } from './components/shared/custom-input/custom-input.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { LoginComponent } from './components/login/login.component';
// import { CurrencyFormatDirective } from './directives/currency-format.directive';

import { environment } from './environment';
import { ComparablesDialogComponent } from './components/calculator/comparables-dialog/comparables-dialog.component';
import { ShareDialogComponent } from './components/calculator/share-dialog/share-dialog.component';
import { LoadSharedPropertyComponent } from './components/calculator/load-shared-property/load-shared-property.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PropertyRoiChartComponent } from "./components/property-roi-chart/property-roi-chart.component";

@NgModule({
  declarations: [
    AppComponent,
    ForecastLayoutComponent,
    AssetGridComponent,
    SummaryDetailsComponent,
    AddAssetDialogComponent,
    AssetGroupsComponent,
    CalculatorComponent,
    CalculationsGridComponent,
    LayoutComponent,
    SaveCalculationDialogComponent,
    GridFilterComponent,
    CustomInputComponent,
    HeaderComponent,
    LoginComponent,
    ComparablesDialogComponent,
    ShareDialogComponent,
    LoadSharedPropertyComponent
    // CurrencyFormatDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxsModule.forRoot([ForecastState, CalculatorState]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatTableModule, MatCardModule,
    MatIconModule, MatListModule, MatGridListModule, MatTabsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    NgxChartsModule,
    PropertyRoiChartComponent
],
  providers: [CurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
