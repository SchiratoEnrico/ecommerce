import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountServices } from '../../services/account-services';

@Component({
  selector: 'app-mail-validation',
  standalone: false,
  templateUrl: './mail-validation.html',
  styleUrl: './mail-validation.css',
})
export class MailValidation implements OnInit {
  // Gestiamo 3 stati per l'interfaccia
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private utServices: AccountServices
  ) {}

  ngOnInit(): void {
    const username = this.route.snapshot.paramMap.get('username');

    if (username) {
      this.confirmEmail(username);
    } else {
      this.status = 'error';
    }
  }

  private confirmEmail(username: string): void {

    this.utServices.validate(username).subscribe({
      next: (response) => {
        this.status = 'success';
      },
      error: (error) => {
        console.error('Errore durante la validazione:', error);
        this.status = 'error';
      }
    });
  }
}
