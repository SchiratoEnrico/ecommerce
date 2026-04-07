import { afterNextRender, Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';
import { MatDrawer } from '@angular/material/sidenav';

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
    public gestioneCarrello: GestioneCarrelloServices
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
}
