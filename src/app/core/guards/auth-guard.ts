import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const msalService = inject(MsalService);

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
    return true;
  }

  msalService.loginRedirect({
    scopes: ['6f4a5212-2919-4a5b-b1a3-b7d97d648a81/.default']
  });
  
  return false;
};