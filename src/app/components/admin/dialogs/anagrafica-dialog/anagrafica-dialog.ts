import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-anagrafica-dialog',
  standalone: false,
  templateUrl: './anagrafica-dialog.html',
  styleUrl: './anagrafica-dialog.css',
})
export class AnagraficaDialog {
  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AnagraficaDialog>,
    // data = { anagrafica: Anagrafica | null, accountId: number | null }
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      nome:       ['', Validators.required],
      cognome:    ['', Validators.required],
      via:        ['', Validators.required],
      citta:      ['', Validators.required],
      provincia:  ['', Validators.required],
      cap:        ['', Validators.required],
      stato:      ['', Validators.required],
      predefinito:[false],
    });

    if (data.anagrafica) {
      this.form.patchValue(data.anagrafica);
    }
  }

  delete() {
    if (!confirm('Confermi eliminazione?')) return;
    this.dialogRef.close({ action: 'delete' });
  }

  save() {
    if (this.form.invalid) return;
    // include accountId nel payload se presente (per la create)
    const payload = {
      ...this.form.value,
      ...(this.data.accountId ? { idAccount: this.data.accountId } : {})
    };
    this.dialogRef.close({ action: 'save', payload });
  }

  close() {
    this.dialogRef.close();
  }
}