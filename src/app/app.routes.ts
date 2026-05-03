import { Routes } from '@angular/router';
import { ProductPage } from './product/product';
import { AboutPage } from './about/about';
import { ContactPage } from './contact/contact';
import { authGuard } from './auth/auth.guard';
import { ProductDetailPage } from './product-detail/product.detail';
import { HealthPage } from './health';

export const routes: Routes = [
  { path: 'health', component: HealthPage },
  { path: '', component: ProductPage },
  { path: 'sobre', component: AboutPage },
  { path: 'contato', component: ContactPage },
  { path: 'produto/:id', component: ProductDetailPage },
  {
    path: 'login',
    loadComponent: () => import('./auth/login').then(m => m.Login)
  },
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'product',
        loadComponent: () => import('./admin/product/list/stock-list').then(m => m.StockList)
      },
      {
        path: 'product/alerts',
        loadComponent: () => import('./admin/product/alerts/stock-alerts').then(m => m.StockAlerts)
      },
      {
        path: 'product/movements',
        loadComponent: () => import('./admin/product/stock-movement-list').then(m => m.StockMovementList)
      },
      {
        path: 'sales',
        loadComponent: () => import('./admin/sales/sales-list').then(m => m.SalesList)
      },
      {
        path: 'sales/pos',
        loadComponent: () => import('./admin/sales/pos').then(m => m.Pos)
      },
      {
        path: 'purchases',
        loadComponent: () => import('./admin/purchases/purchases-list').then(m => m.PurchasesList)
      },
      {
        path: 'purchases/new',
        loadComponent: () => import('./admin/purchases/purchase-form').then(m => m.PurchaseForm)
      },
      {
        path: 'reports',
        loadComponent: () => import('./admin/reports/reports').then(m => m.Reports)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./admin/invoices/invoices').then(m => m.Invoices)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./admin/suppliers/suppliers').then(m => m.Suppliers)
      },
      {
        path: 'marketplaces',
        loadComponent: () => import('./admin/marketplaces/marketplaces').then(m => m.Marketplaces)
      },
      {
        path: 'marketplaces/products',
        loadComponent: () => import('./admin/marketplaces/product-marketplaces').then(m => m.ProductMarketplaces)
      },
      {
        path: 'suppliers/add',
        loadComponent: () => import('./admin/suppliers/supplier-form/supplier-form').then(m => m.SupplierForm)
      },
      {
        path: 'suppliers/edit/:id',
        loadComponent: () => import('./admin/suppliers/supplier-form/supplier-form').then(m => m.SupplierForm),
      },
      {
        path: 'purchases',
        loadComponent: () => import('./admin/purchases/purchases-list').then(m => m.PurchasesList)
      },
      {
        path: 'purchases/new',
        loadComponent: () => import('./admin/purchases/purchase-form').then(m => m.PurchaseForm)
      },
      {
        path: 'purchases/edit/:id',
        loadComponent: () => import('./admin/purchases/purchase-form').then(m => m.PurchaseForm)
      },
      {
        path: 'purchases/view/:id',
        loadComponent: () => import('./admin/purchases/purchase-detail').then(m => m.PurchaseDetail)
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/settings/settings').then(m => m.Settings)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
