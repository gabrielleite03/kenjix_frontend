import { Routes } from '@angular/router';
import { ProductPage } from './product/product';
import { AboutPage } from './about/about';
import { ContactPage } from './contact/contact';

export const routes: Routes = [
  { path: '', component: ProductPage },
  { path: 'sobre', component: AboutPage },
  { path: 'contato', component: ContactPage },
  { path: '**', redirectTo: '' }
];
