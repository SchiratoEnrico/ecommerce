import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from './auth-services';
import { isPlatformBrowser } from '@angular/common';

export const authAuthenticatedGuard: CanActivateFn = (route, state) => {
  
  const authServices = inject(AuthServices);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if(!isPlatformBrowser(platformId)) {
    return true;
  }

  if(authServices.isAutentificated())
    return true;

  return router.createUrlTree(['/login']);
};
