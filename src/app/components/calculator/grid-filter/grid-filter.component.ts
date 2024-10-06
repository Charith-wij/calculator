import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-grid-filter',
  templateUrl: './grid-filter.component.html',
  styleUrls: ['./grid-filter.component.scss']
})
export class GridFilterComponent {
  @Output() statusChange: EventEmitter<string> = new EventEmitter();

  statuses: string[] = ['New', 'Active', 'Expired'];

  onStatusChange(selectedStatus: string): void {
    this.statusChange.emit(selectedStatus);
  }
}