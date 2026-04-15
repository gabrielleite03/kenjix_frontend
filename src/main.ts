import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {appConfig} from './app/app.config';
import { register } from 'swiper/element/bundle';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

register();

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideHttpClient(withInterceptors([authInterceptor]), withFetch())
  ]
}).catch((err) => console.error(err));