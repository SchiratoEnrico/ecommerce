import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-stato-ordine-dialog',
  standalone: false,
  templateUrl: './stato-ordine-dialog.html',
  styleUrl: './stato-ordine-dialog.css',
})
export class StatoOrdineDialog {

  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StatoOrdineDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      statoOrdine: ['', Validators.required]
    });

    if(data){
      this.form.patchValue(data);
    }
  }

  delete(){
    if(!confirm('Confermi eliminazione?')) return;
    this.dialogRef.close({ action: 'delete', id: this.data.id });
  }

  save(){
   if(this.form.invalid) return;
   this.dialogRef.close({ action: 'save', ...this.form.value });
  }

  close(){
    this.dialogRef.close();
  }

}
