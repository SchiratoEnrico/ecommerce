import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GestionePagamentiService } from '../../../services/gestione-pagamenti-service';

interface Pagamento {
  id: number;
  tipo_pagamento: string;
}

@Component({
  selector: 'app-gestione-pagamenti',
  standalone: false,
  templateUrl: './gestione-pagamenti.html',
  styleUrl: './gestione-pagamenti.css',
})
export class GestionePagamenti implements OnInit {
  private gestionePagamentiService = inject(GestionePagamentiService);
  private fb = inject(FormBuilder);

  pagamenti = this.gestionePagamentiService.pagamenti;
  isEditMode = false;
  isModalOpen = false;
  selectedPagamentoId: number | null = null;

  pagamentoForm = this.fb.group({
    tipo_pagamento: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.gestionePagamentiService.list();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedPagamentoId = null;
    this.pagamentoForm.reset({ tipo_pagamento: '' });
    this.isModalOpen = true;
  }

  openEditModal(pagamento: Pagamento): void {
    this.isEditMode = true;
    this.selectedPagamentoId = pagamento.id;
    this.pagamentoForm.patchValue({ tipo_pagamento: pagamento.tipo_pagamento });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  savePagamento(): void {
    if (this.pagamentoForm.invalid) {
      this.pagamentoForm.markAllAsTouched();
      return;
    }

    const tipoPagamento = this.pagamentoForm.controls.tipo_pagamento.value?.trim() ?? '';
    if (!tipoPagamento) {
      this.pagamentoForm.controls.tipo_pagamento.setErrors({ required: true });
      return;
    }

    const body = {
      tipo_pagamento: tipoPagamento,
      ...(this.isEditMode && this.selectedPagamentoId !== null
        ? { id: this.selectedPagamentoId }
        : {}),
    };

    const request$ = this.isEditMode
      ? this.gestionePagamentiService.update(body)
      : this.gestionePagamentiService.create(body);

    request$.subscribe({
      next: () => this.closeModal(),
      error: (err) => {
        console.error('Errore durante il salvataggio del tipo pagamento:', err);
        alert('Salvataggio non riuscito. Controlla backend e payload in console.');
      },
    });
  }

  deletePagamento(id: number): void {
    const confirmed = window.confirm('Vuoi eliminare questo tipo di pagamento?');
    if (!confirmed) {
      return;
    }

    this.gestionePagamentiService.delete(id).subscribe();
  }

  trackById(_: number, pagamento: Pagamento): number {
    return pagamento.id;
  }
}
