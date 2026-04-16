import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Marketplace } from '../admin/marketplaces/marketplaces.model';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketplacesService {
  private http = inject(HttpClient);

  private baseUrl = `${environment.API_URL}/marketplaces`; // ajuste se necessário

  findAll(): Observable<Marketplace[]> {
    return this.http.get<Marketplace[]>(this.baseUrl);
  }

  findById(id: string): Observable<Marketplace> {
    return this.http.get<Marketplace>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Marketplace>): Observable<Marketplace> {
    return this.http.post<Marketplace>(this.baseUrl, data);
  }

  update(id: string, data: Partial<Marketplace>): Observable<Marketplace> {
    return this.http.put<Marketplace>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}