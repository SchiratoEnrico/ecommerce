import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  // Signal per i dati utente e la UI
  currentUser = signal<{ id: number; username: string; ruolo: string } | null>(null);
  isDrawerOpen = signal<boolean>(false);

  private authUrl = 'http://localhost:9090/auth';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
  ) {
    this.recuperaSessione();
  }

  //  LOGICA DI AUTENTICAZIONE E SICUREZZA

  login(body: { username?: string; password?: string }) {
    return this.http.post<any>(`${this.authUrl}/login`, body);
  }

  impostaUtente(rispostaBackend: any) {
    if (isPlatformBrowser(this.platformId)) {
      //  SALVATAGGIO DEL TOKEN
      localStorage.setItem('jwt_token', rispostaBackend.token);

      //  info dell'utente
      const userObj = {
        id: rispostaBackend.id,
        username: rispostaBackend.username,
        ruolo: rispostaBackend.ruolo,
      };

      localStorage.setItem('utenteLoggato', JSON.stringify(userObj));
      this.currentUser.set(userObj);
    }
  }

  recuperaSessione() {
    if (isPlatformBrowser(this.platformId)) {
      const utenteSalvato = localStorage.getItem('utenteLoggato');
      if (utenteSalvato) {
        this.currentUser.set(JSON.parse(utenteSalvato));
      }
    }
  }

  logout() {
    this.resetAll();
  }

  resetAll() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('utenteLoggato');
    }
    this.currentUser.set(null);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null; // L'utente è autenticato solo se ha un token
  }

  isRoleAdmin(): boolean {
    const user = this.currentUser();
    return user !== null && user.ruolo === 'ADMIN';
  }

  //  LOGICA DELLA UI

  setDrawerState(isOpen: boolean) {
    this.isDrawerOpen.set(isOpen);
  }

  toggleDrawer() {
    this.setDrawerState(!this.isDrawerOpen());
  }
}
