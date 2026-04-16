import { Component, signal } from '@angular/core';
import { AccountServices } from '../../services/account-services';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  msg = signal<string | null>(null);
  isSuccess = signal<boolean>(false);

  constructor(private accountService: AccountServices, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.accountService.requestPasswordReset({ email: form.value.email }).subscribe({
      next: (res) => {
        this.isSuccess.set(true);
        this.msg.set(res.msg);
      },
      error: (err) => {
        this.msg.set(err.error?.msg || "Si è verificato un errore");
      }
    });
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
