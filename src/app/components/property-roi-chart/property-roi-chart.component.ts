import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { SetActiveItemIdInState } from 'src/app/actions/calculator.actions';
import { SavedItem } from 'src/app/models/calculator/saved-figures-item.model';
import { TabManagerService } from 'src/app/services/tab-manager.service';
import { CalculatorState } from 'src/app/state/calculator-state';

interface ChartDataPoint {
  name: string;
  series: { name: string; value: number; special?: boolean }[];
  hasInfiniteROI?: boolean;
}

@Component({
  selector: 'app-property-roi-chart',
  imports: [NgxChartsModule],
  standalone: true,
  templateUrl: './property-roi-chart.component.html',
  styleUrl: './property-roi-chart.component.scss'
})
export class PropertyRoiChartComponent implements OnInit {
  data: ChartDataPoint[] = [];
  data2: any[] = [];
  width: number = 1000;
  view: [number, number] = [this.width, 400];
  
  // options - common for both charts
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Property Address';
  showYAxisLabel = true;

  // Options - ROI chart
  yAxisLabel = 'ROI (%)';
  legendTitle = 'ROI';

  // Options - Profit chart
  yAxisLabel2 = 'Profit';
  legendTitle2 = 'Profit / Money left in';

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4f46e5', '#ef4444']
  };

  colorScheme2: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#547d5f', '#b5a337']
  };

  customColors = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4f46e5', '#ef4444']
  };

  constructor(private store: Store,private tabManagerService: TabManagerService) {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize(): void {
    const container = document.querySelector('.chart-container');
    if (container) {
      // this.width = container.clientWidth;
      // const minWidthPerItem = this.data ? (100 * this.data.length) : 500;
      this.width = Math.max(this.width, this.data.length * 73);
    }
  }

  ngOnInit() {
    this.store.select(CalculatorState.getSavedItems).subscribe(
      (data: SavedItem[]) => {
        if (data) {
          this.data = this.transformDataForROI(data);
          this.data2 = this.transformDataForProfit(data);
          this.onResize();
          // setTimeout(() => this.onResize(), 1000);
        }
      }
    );
  }

  onSelect(data: any): void {
    this.store.dispatch(new SetActiveItemIdInState(data.series));
    this.tabManagerService.setActiveTab(2);
  }

  tooltipFormatting1 = (value: any) => `${value.toFixed(2)}%`;
  tooltipFormatting2 = (value: any) => `£ ${value.toFixed(2)}`;
  
  getXPosition(index: number): number {
    const totalItems = this.data.length;
    // Calculate percentage position based on index
    return ((index + 0) * (100 / totalItems));
  }

  private transformDataForROI(rawData: any) {

    return rawData
    .filter((item: any) => item?.formData?.metaData?.address)
    .map((item: any) => {
      const btsRoi = item.figures.exitOptionBTS.returnOnInvestment;
      const brrRoi = item.figures.exitOptionBRR.returnOnInvestment;

      const hasInfiniteROI = brrRoi === "Infinite";

      return {
        name: item.formData.metaData.address,
        hasInfiniteROI,
        series: [
          {
            name: 'Flip ROI',
            value: Number(btsRoi.toFixed(2))
          },
          {
            name: 'Refinance ROI',
            value: hasInfiniteROI ? 0 : Number(brrRoi),
            special: hasInfiniteROI
          }
        ]
      };
    });
  }

  private transformDataForProfit(rawData: any) {

    return rawData.map((item: any) => {
      return {
        name: item.formData.metaData.address,
        series: [
          {
            name: 'Flip Profit',
            value: item.figures.exitOptionBTS.profitFromDeal
          },
          {
            name: 'Money left in',
            value: item.figures.exitOptionBRR.moneyLeftInDeal
          }
        ]
      };
    });
  }

  private isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }
}