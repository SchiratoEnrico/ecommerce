import { Component, inject, OnInit, signal, ViewChild, effect, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Fattura } from '../../../models/fattura';
import { Spedizione } from '../../../models/spedizione';
import { TipoPagamento } from '../../../models/tipo-pagamento.model';
import { FattureServices } from '../../../services/fatture-services';
import { SpedizioneServices } from '../../../services/spedizioni-services';
import { GestionePagamentiService } from '../../../services/gestione-pagamenti-service';
import { FatturaDialog } from '../dialogs/fattura-dialog/fattura-dialog';
import { FatturaDetailsDialog, FatturaDetailsResult } from '../dialogs/fattura-details-dialog/fattura-details-dialog';
import { AuthServices } from '../../../auth/auth-services';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestione-fatture',
  standalone: false,
  templateUrl: './gestione-fatture.html',
  styleUrl: './gestione-fatture.css'
})
export class GestioneFatture implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private fattureService = inject(FattureServices);
  private tipoSpedizioneServices = inject(SpedizioneServices);
  private tipoPagamentoServices = inject(GestionePagamentiService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private auth = inject(AuthServices);
  

  displayedColumns: string[] = ['numeroFattura', 'dataEmissione', 'cliente', 'tipoPagamento', 'tipoSpedizione', 'totale', 'stato'];

  fatture = signal<Fattura[]>([]);
  loading = signal<boolean>(false);
  processing = signal<boolean>(false);
  tipiSpedizione = signal<Spedizione[]>([]);
  tipiPagamento = signal<TipoPagamento[]>([]);

  dataSource = new MatTableDataSource<Fattura>();

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

  constructor() {
    effect(() => {
      this.dataSource.data = this.fatture();
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.loadTipiSpedizione();
    this.loadTipiPagamento();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  resetFilters(): void {
    this.filters = {
      numeroFattura: '', clienteNome: '', clienteCognome: '',
      clienteEmail: '', tipoSpedizione: '', tipoPagamento: '',
      statoFattura: '', id_ordine: null, isbn: '', annoFrom: null, annoTo: null,
    };
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
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
      next: (data: Fattura[]) => {
        this.fatture.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.showMsg('Errore caricamento fatture', true);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void { this.loadData(); }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(FatturaDialog, 
      { width: '800px', data: null });
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

  openDetails(fattura: Fattura): void {
    const ref = this.dialog.open(FatturaDetailsDialog, {
      width: '80%',
      maxHeight: '90vh',
      panelClass: 'fattura-details-dialog',
      data: fattura   // dialog handles findById internally
    });

    ref.afterClosed().subscribe((result: FatturaDetailsResult | undefined) => {
      if (!result || result.action === 'close') return;

      if (result.action === 'changeStato' && result.stato) {
        const call$: Observable<any> | null = this.getStatoCall(result.fattura, result.stato, result.params);
        if (!call$) {
          this.showMsg(`Transizione a ${result.stato} non gestita`, true);
          return;
        }
        call$.subscribe({
          next: () => {
            this.showMsg('Stato aggiornato', false);
            this.loadData();
          },
          error: (err) => this.showMsg(err.error?.msg || 'Errore aggiornamento stato', true)
        });
      }
    });
  }

private getStatoCall(fattura: Fattura, nuovoStato: string, params?: Record<string, any>): Observable<any> | null {
  return this.fattureService.avanzaStato(fattura.id, nuovoStato, params?.['ripristinaCopie']);
}

  private loadTipiSpedizione(): void {
    this.tipoSpedizioneServices.list().subscribe({
      next: (data: Spedizione[]) => this.tipiSpedizione.set(data),
      error: () => this.showMsg('Errore caricamento tipi spedizione', true)
    });
  }

  private loadTipiPagamento(): void {
    this.tipoPagamentoServices.list().subscribe({
      next: (data: TipoPagamento[]) => this.tipiPagamento.set(data),
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
