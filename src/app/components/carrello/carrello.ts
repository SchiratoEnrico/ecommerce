import { Component, OnInit } from '@angular/core';
import { AuthServices } from '../../auth/auth-services';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';

@Component({
  selector: 'app-carrello',
  standalone: false,
  templateUrl: './carrello.html',
  styleUrl: './carrello.css',
})
export class Carrello implements OnInit {
  user: any;

  get chartEl() {
    return this.gestioneCarrello.carrello();
  }

  constructor(
    private auth: AuthServices,
    private gestioneCarrello: GestioneCarrelloServices
  ){}

  ngOnInit(): void {
    this.user = this.auth.currentUser();
    this.caricaCarrello();
  }

  caricaCarrello(){
    this.gestioneCarrello.list().subscribe({
      error: (err) => {
        console.error('Errore nel recupero del carrello:', err);
      }
    });
  }

  formattaEuro(valore: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valore);
  }

  updateQty(riga: any, newQty: number){
    if(newQty < 0)  return;

    const prevQty = riga.numeroCopie;
    riga.numeroCopie = newQty;

    this.gestioneCarrello.updateQty(riga.id, newQty).subscribe({
      next: (res) => {
        if(newQty <= 0){
          const newList = this.chartEl.filter(item => item.id !== riga.id);
          this.gestioneCarrello.carrello.set(newList);
        }
      },
      error: (err) => {
        console.error('Errore nell\'aggiornamento della quantità:', err);
        riga.numeroCopie = prevQty; // Revert alla quantità precedente in caso di errore
      }
    });
  }

  cambioDaTastiera(riga: any, event: Event){
    const inputElement = event.target as HTMLInputElement;
    const newQty = parseInt(inputElement.value, 10);

    if(!isNaN(newQty)){
      this.updateQty(riga, newQty);
    }
    else{
      inputElement.value = riga.numeroCopie.toString(); // Revert al valore precedente se l'input non è un numero valido
    }
  }
}
