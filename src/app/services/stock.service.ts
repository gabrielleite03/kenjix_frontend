import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../src/environment';
import { Product } from './product.service';

export interface Stock {
    productId: number;
    product: Product;
    warehousePlaceId: number;
    quantity: number;
    active: boolean;
    updatedAt: string;
    minPrice?: number;
    maxPrice?: number;
    productName?: string;
    warehouseName?: string;
    warehousePlaceName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StockService {

    private API = `${environment.API_URL}/stocks`;

    // cache
    private cache?: Stock[];
    private lastFetch = 0;
    private TTL = 0.1 * 60 * 1000; // 5 minutos

    constructor(private http: HttpClient) { }

    getStocks(): Observable<Stock[]> {
        const now = Date.now();

        // se cache válido → retorna
        if (this.cache && (now - this.lastFetch) < this.TTL) {
            return of(this.cache);
        }

        // senão busca backend
        return this.http.get<any[]>(this.API).pipe(
            map(response => response.map(item => this.mapToStock(item))),
            tap(data => {
                this.cache = data;
                this.lastFetch = now;
            })
        );
    }

    getStockById(productId: number, warehousePlaceId: number): Observable<Stock> {
        return this.http
            .get<any>(`${this.API}/${productId}/${warehousePlaceId}`)
            .pipe(map(item => this.mapToStock(item)));
    }

    clearCache() {
        this.cache = undefined;
        this.lastFetch = 0;
    }

    mapToStock(item: any): Stock {
        return {
            productId: item.productId,
            product: item.product,
            warehousePlaceId: item.warehousePlaceId,
            quantity: item.quantity,
            active: item.active,
            updatedAt: item.updatedAt,

            minPrice: item.minPrice,
            maxPrice: item.maxPrice,

            productName: item.productName,
            warehouseName: item.warehouseName,
            warehousePlaceName: item.warehousePlaceName
        };
    }
}