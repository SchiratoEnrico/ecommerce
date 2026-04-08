import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthServices } from './auth-services';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthServices);
  const router = inject(Router);
  
  const token = authService.getToken();

  // Clona la richiesta se c'è il token, altrimenti usa quella originale
  let requestToForward = req;
  if (token) {
    requestToForward = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Inoltra la richiesta e mettiti in ascolto di eventuali errori dal backend
  return next(requestToForward).pipe(
    catchError((error: HttpErrorResponse) => {
      
      //intercetto 401 not authorized
      if (error.status === 401) {
        console.warn("Token scaduto o non valido. Eseguo il logout di sicurezza.");
        
        authService.logout(); 
        router.navigate(['/login']);
      }  
      // Propaga l'errore in modo che i componenti possano comunque gestirlo se serve
      return throwError(() => error);
    })
  );
};
