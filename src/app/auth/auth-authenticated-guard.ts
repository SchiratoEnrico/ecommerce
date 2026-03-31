import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from './auth-services';

export const authAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authServices = inject(AuthServices);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // 1. Se siamo sul Server diamo l'OK provvisorio.
  // Sarà il browser a fare il vero controllo una volta scaricata la pagina.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 2. Se siamo nel Browser, facciamo il controllo reale sul LocalStorage
  if (authServices.isAuthenticated()) {
    return true;
  }

  // 3. Se non è loggato, lo mandiamo al login
  return router.createUrlTree(['/login']);
};