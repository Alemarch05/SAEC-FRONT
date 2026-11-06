import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  // Asegurarse de que MSAL esté inicializado antes de buscar cuentas
  try {
    await msalService.instance.initialize();
  } catch (e) {
    // Si ya estaba inicializado, ignoramos el error
  }

  if (msalService.instance.getAllAccounts().length > 0) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};