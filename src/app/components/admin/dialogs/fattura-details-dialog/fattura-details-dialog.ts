// fattura-details-dialog.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Fattura } from '../../../../models/fattura';
import { FattureServices } from '../../../../services/fatture-services';
import { catchError, forkJoin, map, of } from 'rxjs';
import { StatoOrdine } from '../../../../models/stato-ordine';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface FatturaDetailsResult {
  action: 'changeStato' | 'close';
  stato?: string;
  fattura: Fattura;
  params?: Record<string, any>;
}

interface TransitionConfig {
  confirmMessage?: string;
  checkboxes?: { key: string; label: string; default: boolean }[];
}

@Component({
  selector: 'app-fattura-details-dialog',
  standalone: false,
  templateUrl: './fattura-details-dialog.html',
  styleUrl: './fattura-details-dialog.css'
})  
export class FatturaDetailsDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<FatturaDetailsDialog, FatturaDetailsResult>);
  private fattureService = inject(FattureServices);
  private snack = inject(MatSnackBar);
  data: Fattura = inject(MAT_DIALOG_DATA);
  statiPermessi = signal<string[]>([]);
  fattura = signal<Fattura>(this.data);
  loadingRighe = signal<boolean>(false);
  
  righeColumns: string[] = ['isbn', 'prezzoUnitario', 'numeroCopie', 'totaleRiga'];

    // Extra params per transition (checkboxes, confirms, etc.)
  transitionExtras: Record<string, TransitionConfig> = {
    RIMBORSATO: {
      confirmMessage: 'Procedere con il rimborso?',
      checkboxes: [{ key: 'ripristinaCopie', label: 'Ripristinare copie in magazzino', default: false }]
    },
    CANCELLATO: {
      confirmMessage: 'Cancellare questo ordine?'
    },
    RICONSEGNATO: {
      confirmMessage: 'Confermare il reso?'
    },
    RIFIUTATO: {
      confirmMessage: 'Rifiutare il reso?'
    }
  };

  checkboxValues: Record<string, Record<string, boolean>> = {};

  ngOnInit(): void {
    // Caricamento intera fattura + prossimi stati disponibili
    forkJoin({
      fullFattura: this.fattureService.findById(this.fattura().id),
      statiDisponibili: this.fattureService.getNextAllowedStates(this.fattura().id)
                  .pipe(
                    map((stati: StatoOrdine[]): string[]=> stati.map((s: StatoOrdine) => s.statoOrdine)),
                    catchError(() => of([] as string[]))
                  )
    }).subscribe({
      next: (result) => {
        this.statiPermessi.set(result.statiDisponibili);
        this.fattura.set(result.fullFattura);
        this.initCheckboxValues(result.statiDisponibili);
        this.loadingRighe.set(false);
      },
      error: (err: any) => {
        this.showMsg(err.error?.msg ?? 'Errore caricamento dati fattura o stati diponibili', true)
      }
    })
  }

  // carico impostazioni checkbox dagli stati
  private initCheckboxValues(states: string[]): void {
    states.forEach((stato: string) => {
      const config: TransitionConfig | undefined = this.transitionExtras[stato];
      if (config?.checkboxes) {
        this.checkboxValues[stato] = {};
        config.checkboxes.forEach(cb => {
          this.checkboxValues[stato][cb.key] = cb.default;
        });
      }
    });
  }

  getCheckboxes(stato: string): { key: string; label: string }[] {
    return this.transitionExtras[stato]?.checkboxes ?? [];
  }

  getTotaleVoci(): number {
    return (this.fattura().righeFattura ?? []).reduce((sum, r) => sum + r.totaleRiga, 0);
  }

  onTransition(stato: string): void {
  const config: TransitionConfig | undefined = this.transitionExtras[stato];
  const defaultMessage: string = `Confermi transizione a "${stato}"?`;
  const message: string = config?.confirmMessage ?? defaultMessage;

  if (!confirm(message)) return;

  const params: Record<string, any> = this.checkboxValues[stato] ?? {};

  this.dialogRef.close({
    action: 'changeStato',
    stato,
    fattura: this.fattura(),
    params
  });
  }

  onClose(): void {
    this.dialogRef.close({ action: 'close', fattura: this.fattura() });
  }

  showMsg(msg: string, isError: boolean): void {
    setTimeout(() => {
      this.snack.open(msg ?? 'Operazione completata', 'OK', {
        duration: 2000,
        panelClass: isError ? 'snack-error' : 'snack-success'
      });
    });
  }

}