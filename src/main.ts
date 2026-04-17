import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt);

platformBrowser().bootstrapModule(AppModule, {
  
})
  .catch(err => console.error(err));
