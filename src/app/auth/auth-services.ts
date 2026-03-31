import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

// Interfacce per tipizzare i dati 
export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private url = 'http://localhost:9090/auth';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private http: HttpClient
  ) {}
 
  
  login(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.url}/login`, body);
  }
  
  // Salva il token JWT invece di un semplice 1
  setSession(token: string, isAdmin: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('isAdmin', isAdmin ? '1' : '0');
    }
  }

  resetAll() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('isAdmin');
    }
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      // Controlla se il token esiste
      return !!localStorage.getItem('jwt_token'); 
    }
    return false;
  }

  isRoleAdmin(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('isAdmin') === '1';
    }
    return false;
  }
  
  // Metodo utile per recuperare il token per le chiamate API
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }
}