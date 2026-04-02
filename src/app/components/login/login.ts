import { Component, signal, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuthServices } from '../../auth/auth-services';
import { AccountServices } from '../../services/account-services';
import { Router } from '@angular/router';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
   msg = signal("");

  @ViewChild('loginForm') loginForm:NgForm;

   constructor(
      private auth:AuthServices,
      private routing:Router,
      public gestioneCarrello: GestioneCarrelloServices
  ){}

   onSubmit(){
     this.auth.login(this.loginForm.value).subscribe({
      next: (r:any) => {
        this.msg.set("");

        this.auth.impostaUtente(r);

        this.gestioneCarrello.aggiornaDatiCarrello();

        this.routing.navigate(['/home']);

      },
      error: (r:any) => {
        this.msg.set(r.error.msg);
      }
    })
  }

  registrazione(){
    this.routing.navigate(['/registrazione']);
  }

  goHome(){
     this.routing.navigate(['/home']);
  }
}
