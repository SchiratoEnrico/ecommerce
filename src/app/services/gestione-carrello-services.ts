import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';
import { AuthServices } from '../auth/auth-services';

@Injectable({
  providedIn: 'root',
})
export class GestioneCarrelloServices {
  url = 'http://localhost:9090/rest/riga_carrello/';

  carrello = signal<any[]>([]);

  numeroElementi = computed(() => this.carrello().length);

  constructor(
    private http: HttpClient,
    private auth: AuthServices
  ){}

  list(params?: any): Observable<any[]>{
    const user = this.auth.currentUser();

    if (!user?.id) {
      console.warn("Nessun utente loggato, empty chart");
      setTimeout(() => {
        this.carrello.set([]);
      });
      return of([]);
    }

    return this.http.get<any[]>(
      'http://localhost:9090/rest/carrello/findByAccountId',
      { params: { id: user.id } }
    ).pipe(
      switchMap((carrelliDati: any) => {
        if(!carrelliDati || !carrelliDati.id ){
          return of([]);
        }
        const finalParams = {
          ...params,
          chartId: carrelliDati.id
        }
        return this.http.get<any[]>(this.url+'list', {params: finalParams});
      }),
      tap((righe: any[]) => {
        setTimeout(() => {
          this.carrello.set(righe);
        });
      })
    );
  }

  aggiornaDatiCarrello(){
    this.list().subscribe();
  }

  updateQty(idRiga: number, numeroCopie: number){
    const payload = {
      id: idRiga,
      numeroCopie: numeroCopie
    };
    return this.http.put(this.url+'update', payload);
  }
}
