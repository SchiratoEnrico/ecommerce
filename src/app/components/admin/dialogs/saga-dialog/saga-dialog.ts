import { ChangeDetectorRef, Component, Inject, } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Saga } from '../../../../models/saga';

@Component({
  selector: 'app-saga-dialog',
  standalone: false,
  templateUrl: './saga-dialog.html',
  styleUrl: './saga-dialog.css',
})
export class SagaDialog {
    form!: FormGroup; // 
    selectedFile: File | null = null;
    preview: string | null = null;

    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<SagaDialog>,
      private cdr: ChangeDetectorRef,
      @Inject(MAT_DIALOG_DATA) public data: Saga | null
     ) {

      this.form = fb.group({
        nome: ['', Validators.required],
        immagine: [''],
        descrizione: ['', [Validators.required]],
        manga: [[]]
      });
  
      if (data) {
        this.form.patchValue(data);
        if (data.immagine) {
          this.preview = data.immagine;
        }
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
      this.preview = e.target?.result as string;
      this.cdr.detectChanges();
    }
    console.log('updated preview')
    // costruzione url che contiene dati file e lettura, base64 data URL: "data:image/webp;base64,/9j/4AAQ..."
    reader.readAsDataURL(this.selectedFile);
  }  
  
  delete(): void {
    if (!confirm('Confermi eliminazione?')) return;
      this.dialogRef.close({ action: 'delete', id: this.data!.id });
  }
  
    save() {
      if (this.form.invalid) return;
        this.dialogRef.close({ 
          action: 'save', 
          selectedFile: this.selectedFile,
          ...this.form.value });
    }
  
    close() {
      this.dialogRef.close();
    }
  
}
