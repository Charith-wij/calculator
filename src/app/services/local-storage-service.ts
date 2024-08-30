// Angular Service Example
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SavedFiguresItem } from '../models/calculator/saved-figures-item.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() {}

  // Function to save an item to local storage
  saveItem(key: string, value: any): void {
    // Get current items from local storage
    const existingItems = this.getItem(key);
    
    // Check if item already exists, if not, add it
    if (!this.isDuplicate(existingItems, value)) {
      existingItems.push(value);
    }
    else {
      const index = existingItems.findIndex(item => item.formData.metaData.address.toLowerCase() === value.formData.metaData.address.toLowerCase());
      existingItems[index] = value;
    }
    localStorage.setItem(key, JSON.stringify(existingItems));
  }

  // Function to retrieve items from local storage
  getItem(key: string): any[] {
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  }

  // Function to remove an item from local storage
  removeItem(key: string, value: any): void {
    const existingItems = this.getItem(key) as SavedFiguresItem[];

    // Filter out the item to remove
    const updatedItems = existingItems.filter(item => item.formData.metaData.address !== value);
    localStorage.setItem(key, JSON.stringify(updatedItems));
  }

  // Function to clear all items in local storage for a specific key
  clearItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Function to check for duplicates
  private isDuplicate(existingItems: any[], value: any): boolean {
    return existingItems.some(item => item.formData.metaData.address?.toLowerCase() === value.formData.metaData.address?.toLowerCase());
  }

}
