// resolvers/saved-items.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Store } from '@ngxs/store';
import { LoadSavedItemsFromLocalStorage } from '../actions/calculator.actions';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SavedItemsResolver implements Resolve<boolean> {
  constructor(private store: Store) {}

  resolve(): Observable<boolean> {
    return this.store
      .dispatch(new LoadSavedItemsFromLocalStorage())
      .pipe(
        map(() => true)  // Transform the void into a boolean
      );
  }
}