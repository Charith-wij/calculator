import { State, Action, StateContext, Selector } from '@ngxs/store';

import { CalculatorStateModel } from '../models/calculator/calculator-state.model';
import { LoadItem, LoadSavedItemsFromLocalStorage, RemoveItem, SaveItem } from '../actions/calculator.actions';
import { SavedItem } from '../models/calculator/saved-figures-item.model';
import { LocalStorageService } from '../services/local-storage-service';
import { Injectable } from '@angular/core';

@Injectable()
@State<CalculatorStateModel>({
  name: 'calculator',
  defaults: {
    activeItemId: null,
    savedItems: []
  }
})
export class CalculatorState {

  constructor(private readonly localstorageService: LocalStorageService) {
  }

  @Selector()
  static getSavedItems(state: CalculatorStateModel) {
    return state.savedItems;
  }

  @Selector()
  static getActiveItem(state: CalculatorStateModel) {
    return state.savedItems.find(item => item.formData.metaData.address.toLowerCase() === state.activeItemId?.toLowerCase());
  }

  @Action(SaveItem)
  saveItem(ctx: StateContext<CalculatorStateModel>, action: SaveItem) {
    const state = ctx.getState();
    const newItem: SavedItem = {
      formData: action.payload.formData,
      figures: action.payload.figures,
    };

    // Check for existence of the item by ID
    const existingItemIndex = state.savedItems.findIndex(item => item.formData.metaData.address?.toLowerCase() === newItem.formData.metaData.address?.toLowerCase());

    let updatedItemsList: SavedItem[];

    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = state.savedItems[existingItemIndex];
      existingItem.formData = newItem.formData; // Update form data
      existingItem.figures = newItem.figures;   // Update figures
      updatedItemsList = [...state.savedItems];
      updatedItemsList[existingItemIndex] = existingItem; // Replace the updated item in the list
    } else {
      // Add new item
      updatedItemsList = [...state.savedItems, newItem];
    }

    ctx.setState({
      ...state,
      savedItems: updatedItemsList,
      activeItemId: newItem.formData.metaData.address // Optionally set activeItemId to the newly saved item
    });

    // Save to local storage after updating state
    this.saveSavedItemsToLocalStorage(updatedItemsList);
  }

  @Action(LoadItem)
  loadItem(ctx: StateContext<CalculatorStateModel>, action: LoadItem) {
    const state = ctx.getState();
    const selectedItem = state.savedItems.find(item => item.formData.metaData.address?.toLowerCase() === action.payload.toLowerCase());

    if (selectedItem) {
      ctx.setState({
        ...state,
        activeItemId: action.payload
      });
    }
  }

  @Action(RemoveItem)
  removeItem(ctx: StateContext<CalculatorStateModel>, action: RemoveItem) {
    const state = ctx.getState();
    const filteredItems = state.savedItems.filter(item => item.formData.metaData.address?.toLowerCase() !== action.payload.toLowerCase());

    if (filteredItems.length > 0) {
      ctx.setState({
        ...state,
        savedItems: filteredItems
      });
    }
    this.localstorageService.removeItem(action.payload.toLowerCase());
  }

  @Action(LoadSavedItemsFromLocalStorage)
  loadSavedItems(ctx: StateContext<CalculatorStateModel>) {
    const savedItems = this.localstorageService.getItem();
    if (savedItems.length > 0) {
      ctx.setState({
        activeItemId: null, // Or set this as needed
        savedItems: savedItems
      });
    }
  }

  private saveSavedItemsToLocalStorage(savedItemsList: SavedItem[]) {
    this.localstorageService.saveItem(savedItemsList);
  }
}