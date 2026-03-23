import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {


  //per capire in che piattaforma siamo
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  setAutentificated() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isLogged', '1');
    }
  }

  setAdmin() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isAdmin', '1');
    }
  }

  setUser() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isAdmin', '0');
    }
  }

  resetAll() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('isLogged');
    }
  }

  isAutentificated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('isLogged') === '1';
    }

    return false;
  }

  isRoleAdmin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('isAdmin') === '1';
    }

    return false;
  }
}
