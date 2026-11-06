import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { from, switchMap, catchError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const msalService = inject(MsalService);
  const accounts = msalService.instance.getAllAccounts();

  if (accounts.length > 0) {
    // Pedimos el token de forma segura a MSAL
    return from(msalService.instance.acquireTokenSilent({
      account: accounts[0],
      // Usamos el ID limpio sin api:// como configuramos antes
      scopes: ['6f4a5212-2919-4a5b-b1a3-b7d97d648a81/.default'] 
    })).pipe(
      switchMap((result) => {
        const clonedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${result.accessToken}` }
        });
        return next(clonedReq);
      }),
      catchError(() => {
        // Si falla la obtención silenciosa, deja pasar la petición sin token
        return next(req);
      })
    );
  }

  return next(req);
};