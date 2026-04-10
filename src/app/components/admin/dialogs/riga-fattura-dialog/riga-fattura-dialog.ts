import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RigaFattura } from '../../../../models/riga-fattura';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-riga-fattura-dialog',
  standalone: false,
  templateUrl: './riga-fattura-dialog.html',
  styleUrl: './riga-fattura-dialog.css',
})
export class RigaFatturaDialog {
form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RigaFatturaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { riga: RigaFattura | null }
  ) {
    this.isEdit = !!data.riga;

    this.form = this.fb.group({
      isbn: [
        data.riga?.isbn ?? '',
        [Validators.required, Validators.minLength(10)]
      ],
      prezzoUnitario: [
        data.riga?.prezzoUnitario ?? null,
        [Validators.required, Validators.min(0.01)]
      ],
      numeroCopie: [
        data.riga?.numeroCopie ?? 1,
        [Validators.required, Validators.min(1)]
      ],
    });
    if (this.isEdit) {
      this.form.get('isbn')?.disable();
    }
  }

  get totaleRiga(): number {
    const p = parseFloat(this.form.get('prezzoUnitario')?.value) || 0;
    const q = parseInt(this.form.get('numeroCopie')?.value, 10) || 0;
    return p * q;
  }

  save(): void {
    if (this.form.invalid) return;

    const v = this.form.getRawValue(); // getRawValue include anche i campi disabled

    const riga: RigaFattura = {
      id:             this.data.riga?.id ?? undefined,
      isbn:           v.isbn,
      prezzoUnitario: v.prezzoUnitario,
      numeroCopie:    v.numeroCopie,
      totaleRiga:     v.prezzoUnitario * v.numeroCopie
    };

    this.dialogRef.close({ action: 'save', riga });
  }

  delete(): void {
    if (!this.isEdit) return;
    if (confirm(`Rimuovere la riga con ISBN ${this.data.riga?.isbn}?`)) {
      this.dialogRef.close({ action: 'delete', riga: this.data.riga });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

