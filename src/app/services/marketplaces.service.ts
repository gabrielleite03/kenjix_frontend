import { inject, Injectable, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Marketplace } from '../admin/marketplaces/marketplaces.model';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environment';


@Injectable({
  providedIn: 'root'
})
export class MarketplacesService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private baseUrl = `${environment.API_URL}/marketplaces`; // ajuste se necessário

  private selectedMarketplaceSignal = signal<Marketplace | null>(null);

  private reloadTriggerSignal = signal(0);
  reloadTrigger = this.reloadTriggerSignal.asReadonly();

  selectedMarketplace = this.selectedMarketplaceSignal.asReadonly();

  private getAuthHeaders(): HttpHeaders {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('kenji_token');

      if (token) {
        return new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
      }
    }

    return new HttpHeaders();
  }

  setSelectedMarketplace(m: Marketplace) {
  this.selectedMarketplaceSignal.set(m);

  // 🔥 força atualização global
  this.reloadTriggerSignal.update(v => v + 1);
}

  findAll(): Observable<Marketplace[]> {
    return this.http.get<Marketplace[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
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

  private marketplacesSignal = signal<Marketplace[]>([]);

  marketplaces = this.marketplacesSignal.asReadonly();


  activeMarketplaces = computed(() =>
    this.marketplacesSignal().filter(m => m.status === 'active')
  );

  addMarketplace(marketplace: Omit<Marketplace, 'id' | 'createdAt'>) {
    const newMarketplace: Marketplace = {
      id: Math.random().toString(36).substring(2, 9),
      ...marketplace,
      createdAt: new Date().toISOString()
    };
    this.marketplacesSignal.update(list => [newMarketplace, ...list]);
  }

  updateMarketplace(marketplace: Marketplace) {
    this.marketplacesSignal.update(list =>
      list.map(m => m.id === marketplace.id ? marketplace : m)
    );
  }

  deleteMarketplace(id: string) {
    this.marketplacesSignal.update(list => list.filter(m => m.id !== id));
  }

  toggleStatus(id: string) {
    this.marketplacesSignal.update(list =>
      list.map(m => {
        if (m.id === id) {
          return { ...m, status: m.status === 'active' ? 'inactive' : 'active' };
        }
        return m;
      })
    );
  }

  loadMarketplaces() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.findAll().subscribe(data => {
      this.marketplacesSignal.set(data);
    });
  }
}