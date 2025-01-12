import { Component } from '@angular/core';
import { TabManagerService } from '../../../services/tab-manager.service';

@Component({
  selector: 'app-calculator-layout',
  templateUrl: './calculator-layout.component.html',
  styleUrls: ['./calculator-layout.component.scss']
})
export class LayoutComponent {

  constructor(private tabManagerService: TabManagerService) {
    this.tabManagerService.activeTab$.subscribe((tabId: number) => {
      this.setActiveTab(tabId);
    })
  }
  activeTab: number = 1;

  setActiveTab(tab: number) {
    this.activeTab = tab;
  }
}
