import { afterNextRender, Component, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
  numeroElementi: number = 0;

  constructor(
    public auth: AuthServices,
    private routing:Router,
    public gestioneCarrello: GestioneCarrelloServices
  ){}

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
