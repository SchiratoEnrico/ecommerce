import { afterNextRender, Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';
import { MatDrawer } from '@angular/material/sidenav';
import { ImageServices } from '../../services/image-services';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
  @ViewChild('drawer') drawer!: MatDrawer;
  numeroElementi: number = 0;

  constructor(
    public auth: AuthServices,
    private routing:Router,
    public gestioneCarrello: GestioneCarrelloServices,
    private imageServices: ImageServices,
  ){
    afterNextRender(() => {
      const wasOpen = localStorage.getItem('drawerOpen') === 'true';
      if(wasOpen){
        this.drawer.open();
      }
    });
  }

  onDrawerChange(isOpen: boolean){
    localStorage.setItem('drawerOpen', String(isOpen));
  }

  ngOnInit(): void {
    if(this.auth.isAuthenticated()){
      this.gestioneCarrello.aggiornaDatiCarrello();
    }
  }

  logout(){
    this.auth.resetAll();
    this.routing.navigate(['home']);
  }

  login(){
    this.routing.navigate(['login']);
  }

  carrello(){
    this.routing.navigate(['carrello']);
  }

  onUploadDefaultImg(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  this.imageServices.uploadDefault(file).subscribe({
    next: () => {
      // opzionale: feedback all'utente (snackbar, ecc.)
      console.log('Immagine default aggiornata');
      input.value = ''; // reset input per consentire ri-selezione dello stesso file
    },
    error: (err) => console.error('Errore upload immagine default', err)
  });
}
}
