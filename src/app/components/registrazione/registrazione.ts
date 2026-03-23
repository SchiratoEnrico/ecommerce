import { Component, signal, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthServices } from '../../auth/auth-services';
import { AccountServices } from '../../services/account-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrazione',
  standalone: false,
  templateUrl: './registrazione.html',
  styleUrl: './registrazione.css',
})
export class Registrazione {

   msg = signal("");

  @ViewChild('regForm') regForm:NgForm;

   constructor(private utenteServices: AccountServices,
      private auth:AuthServices,
      private routing:Router
  ){}

  onSubmit(){
    console.log(this.regForm.value);

     this.utenteServices.create({
      username:this.regForm.value.username,
      email: this.regForm.form.value.email,
      password: this.regForm.form.value.password,
      ruolo: "USER"
     }).subscribe({
      next: (r:any) => {
        this.msg.set(r.msg);
        this.routing.navigate(['/login']);
      },
      error: (r:any) => {
        this.msg.set(r.error.msg);
      }
    })
  }


  goLogin(){
    this.routing.navigate(['/login']);
  }

  goHome(){
     this.routing.navigate(['/home']);
  }
}
