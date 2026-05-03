import {Injectable, signal, computed} from '@angular/core';
import {Marketplace} from './marketplaces.model';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private marketplacesSignal = signal<Marketplace[]>([
    {
      id: '1',
      name: 'Mercado Livre',
      logo: 'https://logodownload.org/wp-content/uploads/2018/10/mercado-livre-logo-0.png',
      status: 'active',
      commissionRate: 16,
      integrationType: 'api',
      apiUrl: 'https://api.mercadolibre.com',
      apiEndpoint: '/v1/orders',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Shopee',
      logo: 'https://logodownload.org/wp-content/uploads/2021/03/shopee-logo-0.png',
      status: 'active',
      commissionRate: 18,
      integrationType: 'api',
      apiUrl: 'https://partner.shopeemobile.com/api/v2',
      apiEndpoint: '/v2/shop/get_order_list',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Amazon',
      logo: 'https://logodownload.org/wp-content/uploads/2014/04/amazon-logo-0.png',
      status: 'inactive',
      commissionRate: 15,
      integrationType: 'manual',
      createdAt: new Date().toISOString()
    }
  ]);

  marketplaces = this.marketplacesSignal.asReadonly();
  
  activeMarketplaces = computed(() => this.marketplacesSignal().filter(m => m.status === 'active'));

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
}
