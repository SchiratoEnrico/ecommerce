import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID, REQUEST, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  currentUser = signal<{username: string, ruolo: string, id: number} | null>(null);
  isDrawerOpen = signal<boolean>(false);

   //per capire in che piattaforma siamo
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request: any
  ) {
    this.recuperaSessione();
  }

  private getCookie(name: string): string | null {
    if(isPlatformBrowser(this.platformId)){
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }
    else{
      if(this.request && this.request.headers && this.request.headers.cookie) {
        const match = this.request.headers.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      }
    }
    return null;
  }

  private setCookie(name: string, value: string){
    if(isPlatformBrowser(this.platformId)){
      const d = new Date();
      d.setTime(d.getTime() + (7*24*60*60*1000));
      document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
    }
  }

  private deleteCookie(name: string){
    if(isPlatformBrowser(this.platformId)){
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  }

  recuperaSessione() {
    const utenteLoggato = this.getCookie('utenteLoggato');
    if(utenteLoggato){
      this.currentUser.set(JSON.parse(utenteLoggato));
    }

    const drawerCookie = this.getCookie('drawerOpen');

    this.isDrawerOpen.set(false);

    if(isPlatformBrowser(this.platformId)){
      if(drawerCookie === '1'){
        setTimeout(() => {
          this.isDrawerOpen.set(true);
        }, 100);
      }
      else if(drawerCookie === '0'){
        this.isDrawerOpen.set(false);
      }
      else{
        if(this.isAutentificated()){
          setTimeout(() => {
            this.isDrawerOpen.set(true);
          }, 100);
        }
      }
    }
  }

  setDrawerState(isOpen: boolean) {
    this.isDrawerOpen.set(isOpen);
    this.setCookie('drawerOpen', isOpen ? '1' : '0');
  }

  toggleDrawer() {
    this.setDrawerState(!this.isDrawerOpen());
  }

  impostaUtente(datiUtente: any){
    this.currentUser.set(datiUtente);
    this.setCookie('utenteLoggato', JSON.stringify(datiUtente));
  }

  logout(){
    this.resetAll();
  }

  resetAll() {
    this.currentUser.set(null);
    this.deleteCookie('utenteLoggato');
  }

  isAutentificated(): boolean {
    return this.currentUser() !== null;
  }

  isRoleAdmin(): boolean {
    const user = this.currentUser();
    return user !== null && user.ruolo === 'ADMIN';
  }
}
