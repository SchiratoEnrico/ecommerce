import { ChangeDetectorRef, Component } from '@angular/core';
import { Genere, GeneriServices } from '../../../services/generi-services';

@Component({
  selector: 'app-gestione-generi',
  standalone: false,
  templateUrl: './gestione-generi.html',
  styleUrl: './gestione-generi.css',
})
export class GestioneGeneri {
  generi: Genere[] = [];
  modalitaModifica = false;
  genereInModifica: Genere | null = null;
  msg = '';
  isError = false;
  
  formData = {
    descrizione: ''
  };

  constructor(private generiService: GeneriServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.caricaGeneri();
  }

 caricaGeneri(): void {
  this.generiService.list().subscribe({
    next: (data) => {
      console.log("generi caricati");
      this.generi = data;
      this.cdr.detectChanges(); 
    },
    error: () => this.showMsg('Errore nel caricamento dei generi', true)
  });
}

onSubmit(): void {
  if (this.modalitaModifica && this.genereInModifica) {
    this.generiService.update({ id: this.genereInModifica.id, ...this.formData }).subscribe({
      next: (res: any) => {
        console.log("update response: ", res);
        
        this.annullaModifica();
        this.showMsg(res.msg, false);
        this.caricaGeneri();
      },
      error: (err) => this.showMsg(err.error?.msg, true)
    });
  } else {
    this.generiService.create(this.formData).subscribe({
      next: (res: any) => {
        console.log("create response: ", res);
        this.showMsg(res.msg, false);
        this.resetForm();
        this.caricaGeneri();
      },
      error: (err) => this.showMsg(err.error?.msg, true)
    });
  }
}

eliminaGenere(id: number): void {
  if (!confirm('Sei sicuro di voler eliminare questo genere?')) return;
  this.generiService.delete(id).subscribe({
    next: (res: any) => {console.log(res);this.showMsg(res.msg, false)},
    error: (err) => this.showMsg(err.error.msg, true),
    complete: () => this.caricaGeneri()
  });
}

  modificaGenere(genere: Genere): void {
    this.modalitaModifica = true;
    this.genereInModifica = genere;
    this.formData = {
      descrizione: genere.descrizione
    };
    this.msg = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annullaModifica(): void {
    this.modalitaModifica = false;
    this.genereInModifica = null;
    this.resetForm();
    this.msg = '';
  }

  private resetForm(): void {
    this.formData = { descrizione: '' };
  }

  private showMsg(testo: string, errore: boolean): void {
    this.msg = testo;
    this.isError = errore;
  }
}
