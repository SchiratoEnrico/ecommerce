import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { AuthServices } from '../auth/auth-services';

@Injectable({
  providedIn: 'root',
})
export class AccountServices {
  private url = 'http://localhost:9090/rest/account/';

  constructor(
    private http:HttpClient,
    public auth:AuthServices
  ) {}

  login(body:{}){
    return this.http.post(this.url + "login", body);
  }

  create(body:{}){
    return this.http.post(this.url + "create", body);
  }
}
