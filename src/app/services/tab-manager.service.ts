// services/tab-manager.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabManagerService {
  // BehaviorSubject to hold current tab value with 'general' as initial value
  private activeTabSubject = new BehaviorSubject<number>(1);
  
  // Observable that components can subscribe to
  activeTab$ = this.activeTabSubject.asObservable();

  constructor() { }

  // Method to change active tab
  setActiveTab(tabId: number): void {
    this.activeTabSubject.next(tabId);
  }

  // Method to get current active tab value
  getCurrentTab(): number {
    return this.activeTabSubject.getValue();
  }
}