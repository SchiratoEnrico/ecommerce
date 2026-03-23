import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Autore {
  id: number;
  nome: string;
  cognome: string;
  dataNascita: string;
  descrizione: string;
}

@Component({
  selector: 'app-gestione-autori',
  standalone: false,
  templateUrl: './gestione-autori.html',
  styleUrl: './gestione-autori.css'
})
export class GestioneAutori implements OnInit {

  private apiUrl = 'http://localhost:9090/rest/autore';

  autori: Autore[] = [];
  modalitaModifica = false;
  autoreInModifica: Autore | null = null;
  msg = '';
  isError = false;

  formData = {
    nome: '',
    cognome: '',
    dataNascita: '',
    descrizione: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.caricaAutori();
  }

  caricaAutori(): void {
    this.http.get<Autore[]>(`${this.apiUrl}/list`).subscribe({
      next: (data) => this.autori = data,
      error: (err) => this.showMsg('Errore nel caricamento degli autori', true)
    });
  }

  onSubmit(): void {
    if (this.modalitaModifica && this.autoreInModifica) {
       console.log('PAYLOAD UPDATE:', this.formData.dataNascita); // ← qui
      this.http.put(`${this.apiUrl}/update`, {
        id: this.autoreInModifica.id,
        ...this.formData
      }).subscribe({
        next: () => {
          console.log("wela");
          this.showMsg('Autore modificato con successo', false);
          this.annullaModifica();
          this.caricaAutori();
        },
        error: (err) => this.showMsg(err.error?.msg || 'Errore durante la modifica', true)
      });
    } else {
      this.http.post(`${this.apiUrl}/create`, this.formData).subscribe({
        next: () => {
          this.showMsg('Autore aggiunto con successo', false);
          this.resetForm();
          this.caricaAutori();
        },
        error: (err) => this.showMsg(err.error?.msg || 'Errore durante la creazione', true)
      });
    }
  }

  modificaAutore(autore: Autore): void {
    this.modalitaModifica = true;
    this.autoreInModifica = autore;
    this.formData = {
      nome: autore.nome,
      cognome: autore.cognome,
      dataNascita: autore.dataNascita,
      descrizione: autore.descrizione
    };
    this.msg = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminaAutore(id: number): void {
    if (!confirm('Sei sicuro di voler eliminare questo autore?')) return;
    this.http.delete(`${this.apiUrl}/delete`, { params: { id } }).subscribe({
      next: () => {
        this.showMsg('Autore eliminato', false);
        this.caricaAutori();
      },
      error: (err) => this.showMsg(err.error?.msg || 'Errore durante l\'eliminazione', true)
    });
  }

  annullaModifica(): void {
    this.modalitaModifica = false;
    this.autoreInModifica = null;
    this.resetForm();
    this.msg = '';
  }

  private resetForm(): void {
    this.formData = { nome: '', cognome: '', dataNascita: '', descrizione: '' };
  }

  private showMsg(testo: string, errore: boolean): void {
    this.msg = testo;
    this.isError = errore;
    setTimeout(() => this.msg = '', 4000);
  }
}