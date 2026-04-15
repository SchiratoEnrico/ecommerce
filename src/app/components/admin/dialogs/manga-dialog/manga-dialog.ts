import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Manga } from '../../../../models/manga';
import { Saga } from '../../../../models/saga';
import { Autore } from '../../../../models/autore';
import { Genere } from '../../../../models/genere';
import { CasaEditrice } from '../../../../models/casa-editrice';

export interface MangaDialogData {
  manga:        Manga | null;
  saghe:        Saga[];
  autori:       Autore[];
  generi:       Genere[];
  caseEditrici: CasaEditrice[];
}

@Component({
  selector: 'app-manga-dialog',
  standalone: false,
  templateUrl: './manga-dialog.html',
  styleUrl: './manga-dialog.css',
})
export class MangaDialog implements OnInit {
    form!: FormGroup;
    selectedFile: File | null = null;
    preview: string | null = null;

    get manga():        Manga | null    { return this.data.manga; }
    get saghe():        Saga[]          { return this.data.saghe; }
    get autori():       Autore[]        { return this.data.autori; }
    get generi():       Genere[]        { return this.data.generi; }
    get caseEditrici(): CasaEditrice[]  { return this.data.caseEditrici; }
    
    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<MangaDialog>,
      private cdr: ChangeDetectorRef, // x immagini
      @Inject(MAT_DIALOG_DATA) public data: MangaDialogData
     ) {
      this.form = fb.group({
        isbn: [{value: '' , disabled: !!data.manga }, Validators.required],
        titolo: ['', Validators.required],
        dataPubblicazione:[null, Validators.required],
        immagine: [''],
        prezzo: [null,  [Validators.required, Validators.min(0)]],
        numeroCopie: [null, [Validators.required, Validators.min(0)]],
        saga: [null],
        sagaVol: [{ value: null, disabled: true }], // così disabilitato fino a quando saga non viene inserita
        casaEditrice: [null, Validators.required],
        generi: [[], Validators.required],
        autori: [[], Validators.required]
      });
      // NW no patch qui, prima recupero liste
    }

  ngOnInit(): void {

    if (this.manga) {
      this.form.patchValue({
        isbn:             this.manga.isbn,
        titolo:           this.manga.titolo,
        dataPubblicazione: this.manga.dataPubblicazione
          ? new Date(this.manga.dataPubblicazione)
          : null,
        // mat-datepicker works with Date objects, not strings.
        prezzo:       this.manga.prezzo,
        numeroCopie:  this.manga.numeroCopie,
        immagine:     this.manga.immagine,
        sagaVol: this.manga.sagaVol,
        // IDs for the selects: mat-select compares by value reference,
        // so we extract the ID from the nested object.
        casaEditrice: this.manga.casaEditrice?.id ?? null,
        saga:         this.manga.saga?.id         ?? null,
        generi:       this.manga.generi?.map(g => g.id)  ?? [],
        autori:       this.manga.autori?.map(a => a.id)  ?? [],
        });
 
      if (this.manga.immagine) {
            this.preview = this.manga.immagine;
      }
    }
 
    // attivazione di sagavol solo quando saga è settata
    this.form.get('saga')!.valueChanges.subscribe(sagaId => {
      const sagaVolCtrl = this.form.get('sagaVol')!;
      if (sagaId != null) {
        sagaVolCtrl.enable();
      } else {
        sagaVolCtrl.disable();
        sagaVolCtrl.setValue(null);
      }
    });

    // enable sagavol quando qualcuno setta saga 
    if (this.manga?.saga?.id != null) {
      this.form.get('sagaVol')!.enable();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    // cast su HTMLInputElement per accedere a prop .files, da ref:  FileList selected with the <input type='file'> element.
    
    if (!input.files?.length) return;
      
    this.selectedFile = input.files[0];

    // generazione di file preview
    const reader = new FileReader(); // apro file reader
    reader.onload = (e) => {
      // costruzione url che contiene dati file e lettura, base64 data URL: "data:image/webp;base64,/9j/4AAQ..."
      this.preview = e.target?.result as string;
      this.cdr.detectChanges(); // x caricamento immediato immagiine
    }
    console.log('updated preview')
    reader.readAsDataURL(this.selectedFile);
  }  

  compareById(a: number, b: number): boolean {
    return a === b;
  }
 
  
  delete(): void {
    if (!confirm('Confermi eliminazione?')) return;
      this.dialogRef.close({ action: 'delete', id: this.data.manga!.isbn });

  }
  
  save() {
    if (this.form.invalid) return;
    // in raw perchè potrebbero esserci campi disabilitati (es isbn in modalità modifica)
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      action: 'save',
      selectedFile: this.selectedFile, 
      ...raw,
      // Convert Date back to ISO string for the backend (Spring expects String)
      dataPubblicazione: raw.dataPubblicazione instanceof Date
        ? raw.dataPubblicazione.toISOString().split('T')[0]  // "YYYY-MM-DD"
        : raw.dataPubblicazione,
    });
  }
  
  close() {
    this.dialogRef.close();
  }

}
