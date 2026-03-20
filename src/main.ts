import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {appConfig} from './app/app.config';
import { register } from 'swiper/element/bundle';

register();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
