import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrdiniServices } from '../../services/ordini-services';
import { MangaServices } from '../../services/manga-services';
import { GestioneCarrelloServices } from '../../services/gestione-carrello-services'; // <-- Aggiunto import

@Component({
  selector: 'app-pagamento',
  standalone: false,
  templateUrl: './pagamento.html',
  styleUrl: './pagamento.css',
})
export class Pagamento implements OnInit {
  currentOrder: any;
  checkout = false;
  slideValue = 0;

  @ViewChild('sliderInput') sliderInput!: ElementRef;

  constructor(
    private router: Router,
    private mangaService: MangaServices,
    private ordineService: OrdiniServices,
    private carrelloService: GestioneCarrelloServices, // <-- Aggiunto al costruttore
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ){
    const nav = this.router.getCurrentNavigation();
    this.currentOrder = nav?.extras?.state?.['ordine'] || history.state.ordine;
  }

  async ngOnInit() {
    if(this.currentOrder && this.currentOrder.righeOrdine){
      let total = 0;

      const populateDate = this.currentOrder.righeOrdine.map(async (riga: any) => {
        try{
          const mangaRes = await firstValueFrom(this.mangaService.findMangaByIsbn(riga.manga));

          riga.titolo = mangaRes.titolo;
          riga.volume = mangaRes.sagaVol;
          riga.prezzo = mangaRes.prezzo;
          
          total += (riga.prezzo * riga.numeroCopie);
        }
        catch(err){
          console.error("Errore nel recupero del manga", err);
          riga.titolo = "Manga non trovato";
          riga.volume = "-";
        }
      });

      await Promise.all(populateDate);

      const speditionCost = this.currentOrder.spedizione?.costoSpedizione || 0;
      this.currentOrder.totale = total + speditionCost;

      this.cdr.detectChanges();
    }
  }

  async annullaPagamento() {
    if (!this.currentOrder || this.checkout) return;

    if (confirm("Sei sicuro di voler annullare il pagamento? L'ordine verrà rimosso.")) {
      try {
        await firstValueFrom(this.ordineService.delete(this.currentOrder.id));

        this.snackBar.open("Ordine annullato. I prodotti sono ancora nel tuo carrello.", "Chiudi", { duration: 3000 });

        this.router.navigate(['/carrello']);
      } catch (err) {
        console.error("Errore durante l'annullamento:", err);
        this.snackBar.open("Errore durante l'annullamento dell'ordine.", "Chiudi", { duration: 3000 });
      }
    }
  }

  async confermaPagamento() {
    this.checkout = true;

    try {
      // 1. Recuperiamo gli stati permessi e cerchiamo l'ID di "PAGATO"
      const statiPossibili: any = await firstValueFrom(this.ordineService.getNextAllowedStates(this.currentOrder.id));
      const statoPagato = statiPossibili.find((s: any) => s.statoOrdine === 'PAGATO');

      if (!statoPagato) {
        throw new Error("Transizione a PAGATO non trovata o non permessa.");
      }

      // 2. Avanziamo lo stato dell'ordine
      await firstValueFrom(this.ordineService.avanzaStatoOrdine(this.currentOrder.id, statoPagato.id));

      // 3. Svuotiamo il carrello sul DB (se esiste l'ID nel service)
      const carrelloId = this.carrelloService.chartId();
      if (carrelloId) {
        await firstValueFrom(this.carrelloService.empty(carrelloId));
        // Puliamo anche il segnale in frontend per resettare il badge
        this.carrelloService.carrello.set([]);
      }

      // 4. Feedback e navigazione
      console.log("PAGAMENTO CONFERMATO!");
      this.snackBar.open("Pagamento completato con successo! 🎉", "Chiudi", { duration: 3000 });
      
      // Assicurati che '/miei-ordini' sia la rotta corretta configurata nel tuo routing
      this.router.navigate(['/ordini']); 

    } catch (err: any) {
      console.error("Errore durante la conferma del pagamento:", err);
      const errorMsg = err.error?.msg || err.message || "Si è verificato un errore col pagamento.";
      this.snackBar.open(`Attenzione: ${errorMsg}`, "Chiudi", { duration: 5000 });
      
      // Mettiamo il reset in un setTimeout per evitare l'errore NG0100 di Angular
      setTimeout(() => {
        this.checkout = false;
        this.slideValue = 0;
        this.sliderInput.nativeElement.value = '0';
        this.cdr.detectChanges(); // Diciamo ad Angular di riaggiornare la UI in sicurezza
      });
    }
  }

  onSlide(event: Event) {
    if (this.checkout) return;
    
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value, 10);

    this.slideValue = val;

    if (val >= 95) {
      input.value = '100'; 
      this.slideValue = 100; // Aggiorna anche la variabile per la UI
      this.confermaPagamento();
    }
  }

  onSlideEnd(event: Event) {
    if (this.checkout) return;
    
    const input = event.target as HTMLInputElement;
    if (parseInt(input.value, 10) < 100) {
      input.value = '0'; 
      this.slideValue = 0;
    }
  }
}