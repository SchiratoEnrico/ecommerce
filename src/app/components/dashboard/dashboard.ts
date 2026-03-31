import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServices } from '../../auth/auth-services';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(
    public auth: AuthServices,
    private routing: Router
  ) {}

  logout() {
    this.auth.resetAll(); // Rimuove token e ruolo dal localStorage
    this.routing.navigate(['/home']); // Ritorna alla home dopo il logout
  }

  login() {
    this.routing.navigate(['/login']);
  }
}