import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PropertySharingService } from '../../../services/property-sharing.service';
import { Store } from '@ngxs/store';
import { SaveItem, SetActiveItemIdInState } from '../../../actions/calculator.actions';
import { TabManagerService } from '../../../services/tab-manager.service';

@Component({
  selector: 'app-load-shared-property',
  templateUrl: './load-shared-property.component.html',
  styleUrls: ['./load-shared-property.component.scss']
})
export class LoadSharedPropertyComponent {
  propertyData: any;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private sharingService: PropertySharingService,
    private store: Store,
    private router: Router,
    private tabManagerService: TabManagerService
  ) { }

  async ngOnInit() {
    try {
      const shareId = this.route.snapshot.params['shareId'];
      console.log('Loading property with shareId:', shareId);

      this.propertyData = await this.sharingService.loadSharedProperty(shareId);
      console.log('Loaded property data:', this.propertyData);

    } catch (error: any) {
      console.error('Error loading shared property:', error);
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  loadIntoCalculator() {
    // Navigate to calculator with the loaded data
    this.router.navigate(['/calculator'], {
      state: { propertyData: this.propertyData }
    });
    this.tabManagerService.setActiveTab(2);
    this.store.dispatch(new SaveItem(this.propertyData))
      .subscribe(()=> {
        this.store.dispatch(new SetActiveItemIdInState(this.propertyData.metaData.address));
      });
  }
}
