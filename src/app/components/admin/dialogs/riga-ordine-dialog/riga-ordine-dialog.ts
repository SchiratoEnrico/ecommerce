import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-riga-ordine-dialog',
  standalone: false,
  templateUrl: './riga-ordine-dialog.html',
  styleUrl: './riga-ordine-dialog.css',
})
export class RigaOrdineDialog {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RigaOrdineDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      manga: ['', Validators.required], 
      numeroCopie: [data?.riga?.numeroCopie || 1, [Validators.required, Validators.min(1)]],
    });

    if (data?.riga) {
      const mangaIsbn = typeof data.riga.manga === 'string'
        ? data.riga.manga
        : (data.riga.manga as any)?.isbn ?? '';

    this.form.patchValue({
      manga: mangaIsbn,
      numeroCopie: data.riga.numeroCopie ?? 1,
    });
    }
}
  save() {
    if (this.form.invalid) return;
    this.dialogRef.close({
      action: 'save',
      ...this.form.value
    
    });
  }

  close() { this.dialogRef.close();}
}
