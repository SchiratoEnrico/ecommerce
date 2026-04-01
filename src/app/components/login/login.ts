import { Component, signal, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthServices, AuthResponse } from '../../auth/auth-services';
import { AccountServices } from '../../services/account-services';

@Component({
  selector: 'app-login',
  standalone: false, 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  msg = signal("");

  @ViewChild('loginForm') loginForm!: NgForm; // ! per dire a TypeScript che verrà inizializzato

  constructor(
    private auth: AuthServices,
    private routing: Router,
    public gestioneCarrello: GestioneCarrelloServices
  ) {}

  onSubmit() {
    // Sicurezza extra: se il form non è valido, non facciamo la chiamata
    if (this.loginForm.invalid) {
      return;
    }

    this.auth.login(this.loginForm.value).subscribe({
      next: (r: any) => { 
        this.msg.set("");
        console.log("ruolo: ",r.ruolo);
        console.log("token: ",r.token);
        // 1. Verifichiamo se l'utente è admin in base alla risposta del backend
        const isAdmin = r.ruolo === "ADMIN";

        // 2. Salviamo Token e Ruolo in un colpo solo 
        this.auth.setSession(r.token, isAdmin);
        
         this.gestioneCarrello.aggiornaDatiCarrello();

        // 3. Reindirizziamo l'utente
        this.routing.navigate(['/home']);
      },
      error: (err: any) => {
        // Gestione degli errori : Spring Security spesso restituisce 401/403 senza un 'msg' custom.
        // Usiamo un messaggio di fallback generico.
        const errorText = err.error?.msg || err.error?.message || "Credenziali non valide. Riprova.";
        this.msg.set(errorText);
      }
    });
  }

  registrazione() {
    this.routing.navigate(['/registrazione']);
  }

  goHome() {
    this.routing.navigate(['/home']);
  }
}