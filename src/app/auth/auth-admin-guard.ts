import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from './auth-services';

export const authAdminGuard: CanActivateFn = (route, state) => {
  const authServices = inject(AuthServices);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Se siamo sul Server, diamo l'OK provvisorio
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Controllo reale sul Browser
  if (authServices.isRoleAdmin()) {
    return true;
  }

  // Se non è admin, lo rimandiamo alla home
  return router.createUrlTree(['/home']);
};