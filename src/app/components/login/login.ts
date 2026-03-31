import { Component, signal, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuthServices } from '../../auth/auth-services';
import { AccountServices } from '../../services/account-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
   msg = signal("");

  @ViewChild('loginForm') loginForm:NgForm;

   constructor(private utenteServices: AccountServices,
      private auth:AuthServices,
      private routing:Router
  ){}

   onSubmit(){
    console.log(this.loginForm.value);

     this.auth.login(this.loginForm.value).subscribe({
      next: (r:any) => {
        this.msg.set("");
        console.log(r);

        this.auth.setAutentificated();

        if(r.ruolo === "ADMIN"){
          this.auth.setAdmin();
        }else{
          this.auth.setUser();
        }

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
