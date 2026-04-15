import {  ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Fattura } from '../../../models/fattura';
import { FattureServices } from '../../../services/fatture-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FatturaDialog } from '../dialogs/fattura-dialog/fattura-dialog';
import { SpedizioneServices } from '../../../services/spedizioni-services';
import { GestionePagamentiService } from '../../../services/gestione-pagamenti-service';
import { RigaFatturaServices } from '../../../services/riga-fattura-services';
import { RigaFattura } from '../../../models/riga-fattura';
import { RigaFatturaDialog } from '../dialogs/riga-fattura-dialog/riga-fattura-dialog';

@Component({
  selector: 'app-gestione-fatture',
  standalone: false,
  templateUrl: './gestione-fatture.html',
  styleUrl: './gestione-fatture.css'
})
export class GestioneFatture implements OnInit {
 @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  righeColumns: string[] = ['isbn', 'prezzoUnitario', 'numeroCopie', 'totaleRiga', 'azioni'];
 
  dataSource = new MatTableDataSource<Fattura>();
  loading = false;
  processing = false;
  selectedFattura: Fattura | null = null;

  righeFattura: { [idFattura: number]: RigaFattura[] } = {};
  loadingRighe: { [id: number]: boolean } = {};
  righeVisibili: { [id: number]: boolean } = {};
 
  tipiSpedizione: any[] = [];
  tipiPagamento: any[] = [];
 
  filters = {
    numeroFattura: '',
    clienteNome: '',
    clienteCognome: '',
    clienteEmail: '',
    tipoSpedizione: '',
    tipoPagamento: '',
    statoFattura: '',
    id_ordine: null as number | null,
    isbn: '',
    annoFrom: null as number | null,
    annoTo: null as number | null,
  };

  resetFilters(): void {
    this.filters = {
      numeroFattura: '', clienteNome: '', clienteCognome: '',
      clienteEmail: '', tipoSpedizione: '', tipoPagamento: '',
      statoFattura: '', id_ordine: null, isbn: '', annoFrom: null, annoTo: null,
    };
    this.loadData();
  }
 
  constructor(
    private fattureService: FattureServices,
    private tipoSpedizioneServices: SpedizioneServices,
    private rigaFatturaServices: RigaFatturaServices,
    private fattureServices: FattureServices,
    private tipoPagamentoServices: GestionePagamentiService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}
 
  ngOnInit(): void {
    this.loadData();
    this.loadTipiSpedizione();
    this.loadTipiPagamento();
  }
 
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
 
  loadData(): void {
    this.loading = true;
    const params: any = {};
    if (this.filters.numeroFattura)  params.numeroFattura  = this.filters.numeroFattura;
    if (this.filters.clienteNome)    params.clienteNome    = this.filters.clienteNome;
    if (this.filters.clienteCognome) params.clienteCognome = this.filters.clienteCognome;
    if (this.filters.clienteEmail)   params.clienteEmail   = this.filters.clienteEmail;
    if (this.filters.tipoSpedizione) params.tipoSpedizione = this.filters.tipoSpedizione;
    if (this.filters.tipoPagamento)  params.tipoPagamento  = this.filters.tipoPagamento;
    if (this.filters.statoFattura)   params.statoFattura   = this.filters.statoFattura;
    if (this.filters.id_ordine)      params.idOrdine       = this.filters.id_ordine;
    if (this.filters.isbn)           params.isbns          = [this.filters.isbn];
    if (this.filters.annoFrom)       params.annoFrom       = this.filters.annoFrom;
    if (this.filters.annoTo)         params.annoTo         = this.filters.annoTo;
 
    this.fattureService.list(params).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMsg('Errore caricamento fatture', true);
        this.loading = false;
      }
    });
  }
 
 
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(FatturaDialog, { width: '800px', data: null });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action !== 'save') return;
      this.fattureService.create(result.payload).subscribe({
        next: () => {
          this.showMsg('Fattura creata', false);
          this.loadData();
        },
        error: (err) => this.showMsg(err.error?.msg || 'Errore creazione', true)
      });
    });
  }
 
  edit(fattura: Fattura): void {
    const dialogRef = this.dialog.open(FatturaDialog, { width: '800px', data: fattura });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
 
      if (result.action === 'delete') {
        this.fattureService.delete(fattura.id).subscribe({
          next: () => {
            this.showMsg('Fattura eliminata', false);
            this.selectedFattura = null;
            this.loadData();
          },
          error: (err) => this.showMsg(err.error?.msg, true)
        });
        return;
      }
 
      if (result.action === 'save') {
        const fatturaData = { id: fattura.id, ...result.payload };
        console.log('payload update:', JSON.stringify(fatturaData));
        this.fattureService.update(fatturaData as Fattura).subscribe({
          next: () => {
            this.showMsg('Fattura aggiornata', false);
            this.fattureService.findById(fattura.id).subscribe({
              next: (aggiornata) => {
                this.selectedFattura = aggiornata;
                this.loadData();
                this.cdr.detectChanges();
              },
              error: () => {
                this.selectedFattura = null;
                this.loadData();
              }
            });
          },
          error: (err) => this.showMsg(err.error?.msg || 'Errore update fattura', true)
        });
      }
    });
  }
 
  onFilterChange(): void { this.loadData(); }
 
  canConfermaReso(f: Fattura): boolean { return f.statoFattura === 'RICHIESTA_RESO'; }
  canRifiutaReso(f: Fattura): boolean  { return f.statoFattura === 'RICHIESTA_RESO'; }
  canRimborsa(f: Fattura): boolean     { return f.statoFattura === 'RICONSEGNATO'; }
  canEdit(f: Fattura): boolean {return !['RICHIESTA_RESO', 'RICONSEGNATO', 'RIMBORSATO','RIFIUTATO', 'ANNULLATA', 'CONFERMATO'].includes(f.statoFattura);}
 
  confermaReso(fattura: Fattura): void {
    if (!confirm(`Confermare il reso ${fattura.numeroFattura}?`)) return;
    this.processing = true;
    this.fattureService.confermaReso(fattura.id).subscribe({
      next: () => {
        this.showMsg('Reso confermato', false);
        this.processing = false;
        this.selectedFattura = { ...fattura, statoFattura: 'RICONSEGNATO' };
        this.loadData();
        this.cdr.detectChanges();
      },
      error: (err) => { this.showMsg(err.error?.msg || 'Errore conferma reso', true); this.processing = false; }
    });
  }

  rifiutaReso(fattura: Fattura): void {
    if (!confirm(`Rifiutare il reso ${fattura.numeroFattura}?`)) return;
    this.processing = true;
    this.fattureService.rifiutaReso(fattura.id).subscribe({
      next: () => {
        this.showMsg('Reso rifiutato', false);
        this.processing = false;
        this.selectedFattura = { ...fattura, statoFattura: 'RIFIUTATO' };
        this.loadData();
        this.cdr.detectChanges();
      },
      error: (err) => { this.showMsg(err.error?.msg || 'Errore rifiuto reso', true); this.processing = false; }
    });
  }

  rimborsa(fattura: Fattura): void {
    const ripristina = confirm('Ripristinare copie in magazzino?');
    this.processing = true;
    this.fattureService.rimborsa(fattura.id, ripristina).subscribe({
      next: () => {
        this.showMsg('Rimborso effettuato', false);
        this.processing = false;
        this.selectedFattura = { ...fattura, statoFattura: 'RIMBORSATO' };
        this.loadData();
        this.cdr.detectChanges();
      },
      error: (err) => { this.showMsg(err.error?.msg || 'Errore rimborso', true); this.processing = false; }
    });
  }
  /*
  selectFattura(fattura: Fattura): void {
    this.fattureServices.findById(fattura.id).subscribe((fatturaCompleta: any) => {
    this.selectedFattura = fatturaCompleta;
    this.righeVisibili[fattura.id] = false;});
  }
*/
  selectFattura(fattura: Fattura): void {
  // imposta subito la fattura selezionata per aggiornare la UI
  this.selectedFattura = fattura;
  
  // poi carica il dettaglio completo
  this.fattureServices.findById(fattura.id).subscribe((fatturaCompleta: any) => {
    this.selectedFattura = fatturaCompleta;
    this.righeVisibili[fattura.id] = false;
    this.cdr.detectChanges();
  });
}
  toggleRighe(fattura: Fattura, event: Event): void {
    event.stopPropagation();
    const id = Number(fattura.id);
    if (!id || isNaN(id)) return;
    if (this.righeVisibili[id]) {this.righeVisibili = { ...this.righeVisibili, [id]: false };return;}
    if (fattura.righeFattura?.length) {this.righeVisibili = { ...this.righeVisibili, [id]: true };return;}
    this.loadingRighe = { ...this.loadingRighe, [id]: true };

    this.fattureService.findById(id).subscribe({
      next: (dettaglio) => {
        fattura.righeFattura = [...(dettaglio.righeFattura ?? [])];
        this.righeVisibili  = { ...this.righeVisibili,  [id]: true };
        this.loadingRighe   = { ...this.loadingRighe,   [id]: false };
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMsg('Errore caricamento voci', true);
        this.loadingRighe = { ...this.loadingRighe, [id]: false };
        this.cdr.detectChanges();
        }
      });
    }
  getTotaleVoci(fattura: Fattura): number {return (fattura.righeFattura ?? []).reduce((sum, r) => sum + r.totaleRiga, 0);}

  editRigaFattura(fattura: Fattura, riga: RigaFattura, index: number): void {
    const ref = this.dialog.open(RigaFatturaDialog, {width: '400px',data: { riga: { ...riga } }});
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'save') {fattura.righeFattura = fattura.righeFattura!.map((r, i) =>i === index ? result.riga : r );
        this.cdr.detectChanges();
      }
    });
  }

deleteRigaFattura(fattura: Fattura, riga: RigaFattura, index: number): void {
  if (!riga.id) return;
  if (!confirm(`Rimuovere la riga con ISBN ${riga.isbn}?`)) return;

  this.rigaFatturaServices.delete(riga.id).subscribe({
    next: () => {
      fattura.righeFattura = fattura.righeFattura!.filter((_, i) => i !== index);
      this.showMsg('Riga eliminata', false);
      this.cdr.detectChanges();
    },
    error: (err) => this.showMsg(err.error?.msg || 'Errore eliminazione riga', true)
  });
}

addRigaFattura(fattura: any): void {
  const dialogRef = this.dialog.open(RigaFatturaDialog, { width: '480px', data: { riga: null } });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.action === 'save') {
      const nuovaRiga: RigaFattura = {
        ...result.riga,
        idFattura: fattura.id
      };
      this.rigaFatturaServices.create(nuovaRiga).subscribe({
        next: () => {
          this.fattureServices.findById(fattura.id).subscribe((fatturaAggiornata: any) => {
            const index = this.dataSource.data.findIndex(f => f.id === fattura.id);
            if (index !== -1) {
              this.dataSource.data[index] = fatturaAggiornata;
              this.dataSource.data = [...this.dataSource.data];
            }
            this.selectedFattura = fatturaAggiornata;
            this.righeVisibili[fattura.id] = true;
          });
        },
        error: (err) => {
          console.error('Errore creazione riga:', err);
        }
      });
    }
  });
}
  private loadTipiSpedizione(): void {
      this.tipoSpedizioneServices.list().subscribe({
        next: (data) => this.tipiSpedizione = data,
        error: () => this.showMsg('Errore caricamento tipi spedizione', true)
      });
    }
  
    private loadTipiPagamento(): void {
      this.tipoPagamentoServices.list().subscribe({
        next: (data) => this.tipiPagamento = data,
        error: () => this.showMsg('Errore caricamento tipi pagamento', true)
      });
    }

  showMsg(msg: string, isError: boolean): void {
    this.snack.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}