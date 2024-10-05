// Angular Service Example
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SavedItem } from '../models/calculator/saved-figures-item.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  public itemKey: string = 'savedCalculations';

  constructor() {}

  // Function to save an item to local storage
  saveItem(value: any): void {
    localStorage.setItem(this.itemKey, JSON.stringify(value));
  }

  // Function to retrieve items from local storage
  getItem(): any[] {
    const items = localStorage.getItem(this.itemKey);
    return items ? JSON.parse(items) : [];
  }

  // Function to remove an item from local storage
  removeItem(value: any): void {
    const existingItems = this.getItem() as SavedItem[];

    // Filter out the item to remove
    const updatedItems = existingItems.filter(item => item.formData.metaData.address.toLowerCase() !== value);
    localStorage.setItem(this.itemKey, JSON.stringify(updatedItems));
  }

  // Function to clear all items in local storage for a specific key
  clearItem(): void {
    localStorage.removeItem(this.itemKey);
  }

  // Function to check for duplicates
  private isDuplicate(existingItems: any[], value: any): boolean {
    return existingItems.some(item => item.formData.metaData.address?.toLowerCase() === value.formData.metaData.address?.toLowerCase());
  }
}
