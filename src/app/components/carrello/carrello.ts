import { Component, OnInit } from '@angular/core';
import { AuthServices } from '../../auth/auth-services';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdiniServices } from '../../services/ordini-services';
import { CheckoutDialog } from '../checkout-dialog/checkout-dialog';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-carrello',
  standalone: false,
  templateUrl: './carrello.html',
  styleUrl: './carrello.css',
})
export class Carrello implements OnInit {
  user: any;
  idAccount: number;

  get chartEl() {
    return this.gestioneCarrello.carrello();
  }

  constructor(
    private auth: AuthServices,
    private gestioneCarrello: GestioneCarrelloServices,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private ordineService: OrdiniServices
  ){}
  
  async effettuaOrdine(){
    if(!this.chartEl || this.chartEl.length === 0)
      return;

    try {
      const dialogRef = this.dialog.open(CheckoutDialog, {
        width: '600px',
        disableClose: true,
        data: { idAccount: this.idAccount }
      });

      const result = await firstValueFrom(dialogRef.afterClosed());

      if(!result)
        return;

      const { anagraficaId, tipoPagamentoId, tipoSpedizioneId } = result;
      console.log("risultato: ", result)
      const carrelloId = this.gestioneCarrello.chartId();

      if(!carrelloId){
        this.snackBar.open("Errore: ID Carrello non trovato.", "Chiudi", { duration: 3000 });
        return;
      }

      await firstValueFrom(
        this.ordineService.createOrdineFromCarrello(
          carrelloId,
          anagraficaId,
          tipoPagamentoId,
          tipoSpedizioneId
        )
      );

      const completeOrder = await firstValueFrom(
        this.ordineService.getLastCreated()
      );

      let total = 0;
      this.chartEl.forEach((item: any) => {
        total += (item.prezzo * item.numeroCopie);
      });
      completeOrder.totale = total;

      console.log("DATI COMPLETI DELL'ORDINE DAL BACKEND:", completeOrder);
      
      this.snackBar.open('Ordine creato! Preparazione al pagamento...', 'Chiudi', { duration: 3000 });

      // 3. Navighiamo verso /pagamento PASSANDO I DATI REALI dell'ordine
      this.router.navigate(['/pagamento'], { state: { ordine: completeOrder } });
    }
    catch (err: any) {
      console.error('Errore durante la creazione dell\'ordine:', err);

      const errorMsg = err.error?.msg || "Si è verificato un errore imprevisto.";
     
      this.snackBar.open(`Attenzione: ${errorMsg}`, "Chiudi", { 
        duration: 5000, 
        panelClass: 'error-snackbar' 
      });
    }
  }

  ngOnInit(): void {
    this.user = this.auth.currentUser();
    this.idAccount = this.user.id;
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
