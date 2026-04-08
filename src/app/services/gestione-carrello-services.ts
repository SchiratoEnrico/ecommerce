import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap, catchError } from 'rxjs';
import { AuthServices } from '../auth/auth-services'; 

@Injectable({
  providedIn: 'root',
})
export class GestioneCarrelloServices {
  url = 'http://localhost:9090/rest/'; 

  carrello = signal<any[]>([]);
  numeroElementi = computed(() => this.carrello().length);

  constructor(
    private http: HttpClient,
    private auth: AuthServices
  ){}

  listAll(): Observable<any[]>{
    return this.http.get<any[]>('http://localhost:9090/rest/carrello/list');
  }

  list(params?: any): Observable<any[]> {
    const user = this.auth.currentUser();

    if (!user || !user.id) {
      this.carrello.set([]);
      return of([]);
    }

    //  Chiediamo al backend  il Carrello associato al  Account
    return this.http.get<any>(`${this.url}carrello/findByAccountId`, { params: { id: user.id } }).pipe(
      switchMap((carrelloDto: any) => {
        if (!carrelloDto || !carrelloDto.id) {
          return of([]);
        }
        //  Chiediamo al backend ( le righe di  carrello specifico
        const finalParams = {
          ...params,
          chartId: carrelloDto.id
        };
        return this.http.get<any[]>(`${this.url}riga_carrello/list`, { params: finalParams });
      }),
      tap((righe: any[]) => {
        this.carrello.set(righe || []);
      }),
      catchError(err => {
        console.error('Errore nel recupero del carrello:', err);
        this.carrello.set([]);
        return of([]);
      })
    );
  }

  aggiornaDatiCarrello() {
    this.list().subscribe();
  }

  updateQty(idRiga: number, numeroCopie: number) {
    const payload = {
      id: idRiga,
      numeroCopie: numeroCopie
    };
    return this.http.put(`${this.url}riga_carrello/update`, payload);
  }
}