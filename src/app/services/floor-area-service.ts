// Angular Service Example
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FloorAreaService {
  constructor(private http: HttpClient) {}

  getFloorArea(postcode: string, houseNo: string, streetName: string): Observable<any> {
    return this.http.post('/api/scrape', { postcode, houseNo, streetName });
  }
}