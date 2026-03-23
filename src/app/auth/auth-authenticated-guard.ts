import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from './auth-services';

export const authAuthenticatedGuard: CanActivateFn = (route, state) => {
  
  const authServices = inject(AuthServices);
  const router = inject(Router);

  if(authServices.isAutentificated())
    return true;

  return router.createUrlTree(['/login']);
};
