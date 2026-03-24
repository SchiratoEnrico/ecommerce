import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Autore, AutoriServices } from '../../../services/autori-services';

@Component({
  selector: 'app-gestione-autori',
  standalone: false,
  templateUrl: './gestione-autori.html',
  styleUrl: './gestione-autori.css'
})
export class GestioneAutori implements OnInit {

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

  constructor(private autoriService: AutoriServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.caricaAutori();
  }

 caricaAutori(): void {
  this.autoriService.list().subscribe({
    next: (data) => {
      console.log("autori caricati");
      this.autori = data;
      this.cdr.detectChanges(); 
    },
    error: () => this.showMsg('Errore nel caricamento degli autori', true)
  });
}

onSubmit(): void {
  if (this.modalitaModifica && this.autoreInModifica) {
    this.autoriService.update({ id: this.autoreInModifica.id, ...this.formData }).subscribe({
      next: (res: any) => {
        console.log("update response: ", res);
        
        this.annullaModifica();
        this.showMsg(res.msg, false);
        this.caricaAutori();
      },
      error: (err) => this.showMsg(err.error?.msg, true)
    });
  } else {
    this.autoriService.create(this.formData).subscribe({
      next: (res: any) => {
        console.log("create response: ", res);
        this.showMsg(res.msg, false);
        this.resetForm();
        this.caricaAutori();
      },
      error: (err) => this.showMsg(err.error?.msg, true)
    });
  }
}

eliminaAutore(id: number): void {
  if (!confirm('Sei sicuro di voler eliminare questo autore?')) return;
  this.autoriService.delete(id).subscribe({
    next: (res: any) => this.showMsg(res.msg, false),
    error: (err) => this.showMsg(err.error?.msg, true),
    complete: () => this.caricaAutori()
  });
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
  }
}