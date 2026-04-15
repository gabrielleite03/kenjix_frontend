import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environment';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  storageLocations: StorageLocation[];
}

export interface StorageLocation {
  id: string;
  warehouseId: string;
  name: string;
  type: string;
  capacity: number;
  active: true;
}

export interface StorageLocationType {
  id: number;
  name: string;
  value: string;
  active: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private API = `${environment.API_URL}/warehouses`;
  private API_STORAGE_LOCATION_TYPES = `${environment.API_URL}/storage-location-types`;

  constructor(private http: HttpClient) { }
  create(warehouse: Warehouse): Observable<Warehouse> {
    const token = localStorage.getItem('kenji_token');
    return this.http.post<Warehouse>(this.API, warehouse, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getAll(): Observable<Warehouse[]> {
    const token = localStorage.getItem('kenji_token');
    return this.http.get<Warehouse[]>(this.API, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  }

  updateWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.put<Warehouse>(
      `${this.API}/${warehouse.id}`,
      warehouse
    );
  }

  getAllStorageLocationTypes(): Observable<StorageLocationType[]> {
    const token = localStorage.getItem('kenji_token');
    return this.http.get<StorageLocationType[]>(this.API_STORAGE_LOCATION_TYPES, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  }


  createLocation(location: StorageLocation): Observable<StorageLocation> {
    const token = localStorage.getItem('kenji_token');
    return this.http.post<StorageLocation>(
      `${environment.API_URL}/warehouse-places`,
      location,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  createStorageLocation(
    warehouseId: string,
    location: StorageLocation
  ): Observable<StorageLocation> {

    const token = localStorage.getItem('kenji_token');

    return this.http.post<StorageLocation>(
      `${environment.API_URL}/warehouses-storage-locations/${warehouseId}`,
      location,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  getStorageLocations(warehouseId: string) {
    return this.http.get<any[]>(
      `${environment.API_URL}/warehouses-storage-locations/${warehouseId}`
    );
  }

  deleteStorageLocation(warehouseId: string, locationId: string) {
    const token = localStorage.getItem('kenji_token');
    return this.http.delete(
      `${environment.API_URL}/warehouses-storage-locations/${warehouseId}/${locationId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }

  updateStorageLocation(
    warehouseId: string,
    locationId: string,
    location: StorageLocation
  ) {
    const token = localStorage.getItem('kenji_token');
    return this.http.put(
      `${environment.API_URL}/warehouses-storage-locations/${warehouseId}/${locationId}`,
      location,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
  }
}