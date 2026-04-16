import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountServices } from '../../services/account-services';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit{
  token: string = '';
  msg = signal<string | null>(null);
  isSuccess = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute, 
    private accountService: AccountServices,
    private router: Router
  ) {}

  ngOnInit() {
    // Catturiamo il token dall'URL (es: ?token=abc-123)
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.msg.set("Token mancante o non valido. Richiedi un nuovo link.");
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.token) return;

    const payload = {
      token: this.token,
      newPassword: form.value.password
    };

    this.accountService.resetPassword(payload).subscribe({
      next: (res) => {
        this.isSuccess.set(true);
        this.msg.set(res.msg); // "Password reimpostata con successo"
      },
      error: (err) => {
        this.msg.set(err.error?.msg || "Si è verificato un errore col token. Potrebbe essere scaduto.");
      }
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
