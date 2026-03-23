import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AccountServices {
  private url = 'http://localhost:9090/rest/account/';

  constructor(private http:HttpClient) {}

  login(body:{}){
    return this.http.post(this.url + "login", body);
  }

  create(body:{}){
    return this.http.post(this.url + "create", body);
  }
}
