import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { ProductMarketplace, MarketplaceProductDisplay } from './product-marketplace.model';
import { ProductService } from '../product/product.service';
import { MarketplacesService } from '../../services/marketplaces.service';
import { environment } from '../../../../src/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductMarketplaceService {

    private productService = inject(ProductService);
    private marketplacesService = inject(MarketplacesService);
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);

    private baseUrl = `${environment.API_URL}/product-marketplaces`;

    // 🔥 SOURCE OF TRUTH (API)
    private productMarketplacesSignal = signal<ProductMarketplace[]>([]);
    productsMarketplace = this.productMarketplacesSignal.asReadonly();

    // 🔥 COMPUTED PARA UI
    displayProducts = computed<MarketplaceProductDisplay[]>(() => {
        const mps = this.productMarketplacesSignal();
        const products = this.productService.products();
        const marketplaces = this.marketplacesService.marketplaces();

        return mps.map(mp => {
            const product = products.find(p => Number(p.id) === mp.productId);
            const marketplace = marketplaces.find(m => Number(m.id) === mp.marketplaceId);

            const productImage =
                (product?.images?.[0] as any)?.url || // 👈 aqui está a correção
                'https://picsum.photos/seed/default/100/100';

            return {
                ...mp,
                productName: product?.name || 'Produto não encontrado',
                productImage,
                productSku: product?.sku || 'N/A',
                marketplaceName: marketplace?.name || 'Marketplace não encontrado',
                marketplaceLogo: marketplace?.logo || ''
            };
        });
    });

    // 🔥 CREATE
    addProductMarketplace(data: Omit<ProductMarketplace, 'id' | 'createdAt' | 'updatedAt'>) {
        return this.http.post<ProductMarketplace>(this.baseUrl, data, {
            headers: this.getAuthHeaders()
        });
    }

    // 🔥 UPDATE
    updateProductMarketplace(id: string, data: Partial<ProductMarketplace>) {
        return this.http.put<ProductMarketplace>(`${this.baseUrl}/${id}`, data, {
            headers: this.getAuthHeaders()
        });
    }

    // 🔥 DELETE
    deleteProductMarketplace(id: string) {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, {
            headers: this.getAuthHeaders()
        });
    }

    // 🔥 LOAD (GET ALL)
    loadProductsMarketplaces() {
        this.http.get<ProductMarketplace[]>(this.baseUrl, {
            headers: this.getAuthHeaders()
        }).subscribe({
            next: data => {
                console.log('API product-marketplaces:', data); // debug
                this.productMarketplacesSignal.set(data);
            },
            error: err => {
                console.error('Erro ao carregar product-marketplaces:', err);
            }
        });
    }

    // 🔐 AUTH HEADER
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
}