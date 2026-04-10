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

@Component({
  selector: 'app-gestione-fatture',
  standalone: false,
  templateUrl: './gestione-fatture.html',
  styleUrl: './gestione-fatture.css'
})
export class GestioneFatture implements OnInit {
 @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  righeColumns: string[] = ['isbn', 'prezzoUnitario', 'numeroCopie', 'totaleRiga'];
 
  dataSource = new MatTableDataSource<Fattura>();
  loading = false;
  processing = false;
  selectedFattura: Fattura | null = null;

  righeVisibili: { [id: number]: boolean } = {};
  righeLoading = false;
 
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
 
  constructor(
    private fattureService: FattureServices,
    private tipoSpedizioneServices: SpedizioneServices,
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
    if (this.filters.id_ordine)      params.id_ordine      = this.filters.id_ordine;
    if (this.filters.isbn)           params.isbn           = this.filters.isbn;
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
  canRimborsa(f: Fattura): boolean     { return f.statoFattura === 'RESTITUITO'; }
  canEdit(f: Fattura): boolean         { return !['RICHIESTA_RESO', 'RESTITUITO', 'RIMBORSATO', 'RIFIUTATO', 'ANNULLATA'].includes(f.statoFattura); }

  resetFilters(): void {
    this.filters = {
      numeroFattura: '', clienteNome: '', clienteCognome: '',
      clienteEmail: '', tipoSpedizione: '', tipoPagamento: '',
      statoFattura: '', id_ordine: null, isbn: '', annoFrom: null, annoTo: null,
    };
    this.loadData();
  }
 
  confermaReso(fattura: Fattura): void {
    if (!confirm(`Confermare il reso ${fattura.numeroFattura}?`)) return;
    this.processing = true;
    this.fattureService.confermaReso(fattura.id).subscribe({
      next: () => {
        this.showMsg('Reso confermato', false);
        this.processing = false;
        this.selectedFattura = { ...fattura, statoFattura: 'RESTITUITO' };
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
 
  selectFattura(fattura: Fattura): void {
  this.selectedFattura = fattura;
  // reset visibilità righe quando cambi fattura
  this.righeVisibili = {};
}
toggleRighe(fattura: Fattura, event: Event): void {
  event.stopPropagation();
  const id = fattura.id;

  if (this.righeVisibili[id]) {
    this.righeVisibili[id] = false;
    return;
  }

  // se già caricate in precedenza, mostra subito
  if (fattura.righeFattura?.length) {
    this.righeVisibili[id] = true;
    return;
  }

  // altrimenti carica via findById
  this.righeLoading = true;
  this.fattureService.findById(fattura.id).subscribe({
    next: (dettaglio) => {
      fattura.righeFattura = dettaglio.righeFattura;
      this.righeVisibili[id] = true;
      this.righeLoading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.showMsg('Errore caricamento voci', true);
      this.righeLoading = false;
    }
  });
}
 
  getTotaleVoci(fattura: Fattura): number {
    return (fattura.righeFattura ?? []).reduce((sum, r) => sum + r.totaleRiga, 0);
  }
 
  showMsg(msg: string, isError: boolean): void {
    this.snack.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}