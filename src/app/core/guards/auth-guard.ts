import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { TwoFactorService } from '../services/two-factor.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const msalService = inject(MsalService);
  const twoFactorService = inject(TwoFactorService);
  const router = inject(Router);

  try {
    await msalService.instance.initialize();
    
    const response = await msalService.instance.handleRedirectPromise();
    
    if (response !== null && response.account !== null) {
      msalService.instance.setActiveAccount(response.account);
    }
  } catch (e) {
    console.error("Error en autenticación MSAL", e);
  }

  const accounts = msalService.instance.getAllAccounts();
  if (accounts.length > 0) {
    if (!msalService.instance.getActiveAccount()) {
      msalService.instance.setActiveAccount(accounts[0]);
    }

    if (state.url.includes('/verificar-2fa')) {
      return true;
    }

    if (!twoFactorService.isVerifiedLocally()) {
      return router.createUrlTree(['/verificar-2fa']);
    }

    return true;
  }

  twoFactorService.clearVerification();

  msalService.loginRedirect({
    scopes: ['6f4a5212-2919-4a5b-b1a3-b7d97d648a81/.default']
  });
  
  return false;
};