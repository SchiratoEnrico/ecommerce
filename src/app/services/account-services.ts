import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { AuthServices } from '../auth/auth-services';
import { Account } from '../models/account';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountServices {
  private url = 'http://localhost:9090/rest/account';

  constructor(
    private http:HttpClient,
    public auth:AuthServices
  ) {}

  login(body:{}){
    return this.http.post(this.url + "/login", body);
  }

  create(body:{}){
    return this.http.post(this.url + "/create", body);
  }

  update(body: Account): Observable<any> {
    return this.http.put(`${this.url}/update`, body);
  }
 
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete/${id}`);
  }
 
  list(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.url}/list`);
  }
 
  findById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.url}/findById`, { params: { id } });
  }

  findByFilters(username: string, email: string, ruolo: string): Observable<Account[]> {
      return this.http.get<Account[]>(`${this.url}/findByFilters`, { params: { username, email, ruolo } });
  }

  findByUsername(username: string): Observable<Account> {
    return this.http.get<Account>(`${this.url}/findByUsername`, { params: { username } });
  }
}
