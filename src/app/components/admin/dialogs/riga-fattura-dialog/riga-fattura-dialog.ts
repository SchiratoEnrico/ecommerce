import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RigaFattura } from '../../../../models/riga-fattura';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RigaFatturaServices } from '../../../../services/riga-fattura-services';

@Component({
  selector: 'app-riga-fattura-dialog',
  standalone: false,
  templateUrl: './riga-fattura-dialog.html',
  styleUrl: './riga-fattura-dialog.css',
})
export class RigaFatturaDialog {
  form: FormGroup;
  isEdit: boolean;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RigaFatturaDialog>,
    private rigaService: RigaFatturaServices,
    @Inject(MAT_DIALOG_DATA) public data: { riga: RigaFattura | null }
  ) {
    this.isEdit = !!data.riga;

    this.form = this.fb.group({
      isbn:           [data.riga?.isbn ?? '',   [Validators.required, Validators.minLength(10)]],
      prezzoUnitario: [data.riga?.prezzoUnitario ?? null, [Validators.required, Validators.min(0.01)]],
      numeroCopie:    [data.riga?.numeroCopie ?? 1,       [Validators.required, Validators.min(1)]],
    });

    if (this.isEdit) this.form.get('isbn')?.disable();
  }

  get totaleRiga(): number {
    const p = parseFloat(this.form.get('prezzoUnitario')?.value) || 0;
    const q = parseInt(this.form.get('numeroCopie')?.value, 10) || 0;
    return p * q;
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    const riga: RigaFattura = {
      id:             this.data.riga?.id ?? undefined,
      isbn:           v.isbn,
      prezzoUnitario: v.prezzoUnitario,
      numeroCopie:    v.numeroCopie,
      totaleRiga:     v.prezzoUnitario * v.numeroCopie
    };

    this.loading = true;

    if (this.isEdit) {
      // UPDATE diretto al backend
      this.rigaService.update(riga).subscribe({
        next: () => this.dialogRef.close({ action: 'save', riga }),
        error: () => { this.loading = false; }
      });
    } else {
      // In creazione non chiamiamo il backend qui:
      // la riga viene aggiunta localmente e salvata insieme alla fattura
      this.dialogRef.close({ action: 'save', riga });
    }
  }

  delete(): void {
    if (!this.isEdit || !this.data.riga?.id) return;
    if (!confirm(`Rimuovere la riga con ISBN ${this.data.riga.isbn}?`)) return;

    this.loading = true;
    this.rigaService.delete(this.data.riga.id).subscribe({
      next: () => this.dialogRef.close({ action: 'delete', riga: this.data.riga }),
      error: () => { this.loading = false; }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

