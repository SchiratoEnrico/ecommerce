import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthServices } from '../../auth/auth-services';
import { AccountServices } from '../../services/account-services';
import { AnagraficaService } from '../../services/anagrafica-service';
import { Account } from '../../models/account';


@Component({
  selector: 'app-profilo',
  standalone: false,
  templateUrl: './profilo.html',
  styleUrl: './profilo.css'
})
export class Profilo implements OnInit {
  
  accountLoggato: Account | null = null;
  
  // Password
  nuovaPassword = '';
  confermaPassword = '';
  
  // Messaggi
  msgAccount = '';
  msgPassword = '';
  msgAnagrafica = '';
  msgVerificaMail = ''; 

  // Anagrafiche
  indirizzi: any[] = [];
  mostraFormAnagrafica = false;
  nuovoIndirizzo: any = {}; // Oggetto per il form inline

  constructor(
    private auth: AuthServices,
    private accountService: AccountServices,
    private anagraficaService: AnagraficaService,
    private cdr: ChangeDetectorRef // Risolve il bug del messaggio che non appare
  ) {}

  ngOnInit(): void {
    const userSession = this.auth.currentUser();
    if (userSession) {
      this.accountService.findById(userSession.id).subscribe({
        next: (res: Account) => {
          this.accountLoggato = res;
          this.caricaIndirizzi();
        },
        error: (err) => console.error("Errore caricamento account", err)
      });
    }
  }

  // --- METODI ACCOUNT ---

  salvaDatiPersonali() {
    if (!this.accountLoggato) return;
    
    this.accountService.update(this.accountLoggato).subscribe({
      next: (res: any) => {
        this.msgAccount = "Dati aggiornati con successo!";
        this.cdr.detectChanges(); // Forza l'aggiornamento UI immediato
        
        setTimeout(() => {
          this.msgAccount = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.msgAccount = "Errore: " + (err.error?.msg || "Impossibile aggiornare");
        this.cdr.detectChanges();
      }
    });
  }

  salvaNuovaPassword() {
    if (!this.accountLoggato || !this.nuovaPassword) return;

    // CONTROLLO CONFERMA PASSWORD
    if (this.nuovaPassword !== this.confermaPassword) {
      this.msgPassword = "Le password non coincidono!";
      return;
    }

    const payload: Account = { 
      ...this.accountLoggato, 
      password: this.nuovaPassword 
    };

    this.accountService.update(payload).subscribe({
      next: (res: any) => {
        this.msgPassword = "Password aggiornata con successo!";
        this.nuovaPassword = '';
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.msgPassword = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.msgPassword = "Errore: " + (err.error?.msg || "Impossibile aggiornare");
        this.cdr.detectChanges();
      }
    });
  }

  richiediNuovaVerifica() {
    if (!this.accountLoggato) return;

    this.accountService.resendValidationMail(this.accountLoggato.username).subscribe({
      next: (res: any) => {
        this.msgVerificaMail = "Link di verifica inviato! Controlla la tua casella di posta.";
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.msgVerificaMail = '';
          this.cdr.detectChanges();
        }, 5000); // Il messaggio scompare dopo 5 secondi
      },
      error: (err) => {
        this.msgVerificaMail = "Errore durante l'invio della mail di verifica.";
        this.cdr.detectChanges();
      }
    });
  }

  // --- METODI ANAGRAFICA ---
/*
  caricaIndirizzi() {
    if (this.accountLoggato) {
      this.anagraficaService.findByAccountId(this.accountLoggato.id).subscribe({
        next: (res) => {
          this.indirizzi = res;
          this.cdr.detectChanges();
        }
      });
    }
  }
*/
caricaIndirizzi() {
  if (this.accountLoggato) {
    this.anagraficaService.findByAccountId(this.accountLoggato.id).subscribe({
      next: (res) => {
        this.indirizzi = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Errore caricamento indirizzi", err);
        this.indirizzi = []; // evita che l'app si blocchi
      }
    });
  }
}
  toggleFormAnagrafica() {
   this.mostraFormAnagrafica = !this.mostraFormAnagrafica;
    if (!this.mostraFormAnagrafica) {
      // Quando chiudo pulisco l'oggetto
      this.nuovoIndirizzo = {};
    } else {
      // Quando apro inizializzo il predefinito a false
      this.nuovoIndirizzo = { predefinito: false };
    }
  }

  salvaIndirizzo() {
    if (!this.accountLoggato) return;

    // Agganciamo l'indirizzo all'account loggato
    this.nuovoIndirizzo.idAccount = this.accountLoggato.id ;

    // Assicuriamoci che il predefinito sia un booleano, se l'utente non lo tocca
    if (this.nuovoIndirizzo.predefinito === undefined) {
      this.nuovoIndirizzo.predefinito = false;
    }

    this.anagraficaService.create(this.nuovoIndirizzo).subscribe({
      next: (res:any) => {
        this.caricaIndirizzi(); // Ricarica la lista aggiornata
        this.toggleFormAnagrafica(); // Chiude il form
        this.msgAnagrafica = res.msg;
        this.cdr.detectChanges();
        setTimeout(() => { this.msgAnagrafica = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        console.error("Errore salvataggio anagrafica", err);
        this.cdr.detectChanges();
      }
    });
  }

  eliminaIndirizzo(id: number) {
    if(confirm("Sei sicuro di voler eliminare questo indirizzo?")) {
      this.anagraficaService.delete(id).subscribe({
        next: () => this.caricaIndirizzi(),
        error: (err) => console.error("Errore eliminazione", err)
      });
    }
  }
}