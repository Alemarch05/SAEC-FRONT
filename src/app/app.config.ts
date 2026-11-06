import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MSAL_INSTANCE, MsalService } from '@azure/msal-angular';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';
import { authInterceptor } from './core/interceptors/auth.interceptor-interceptor';

// Fábrica de configuración de MSAL
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '6f4a5212-2919-4a5b-b1a3-b7d97d648a81',
      authority: 'https://login.microsoftonline.com/4c87468f-a072-4e8e-a8ad-f04e3884f1cd',
      redirectUri: 'http://localhost:4200' // Asegúrate de usar el puerto exacto que muestra tu navegador
    },
    cache: {
      cacheLocation: 'localStorage',
    }
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService,
    provideAnimationsAsync()
  ]
};
