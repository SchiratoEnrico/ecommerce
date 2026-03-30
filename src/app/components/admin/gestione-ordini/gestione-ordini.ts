import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { OrdiniServices } from '../../../services/ordini-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Ordine } from '../../../models/ordine.model';
import { OrdiniDialog } from '../dialogs/ordini-dialog/ordini-dialog';
import { RigaOrdine } from '../../../models/riga-ordine.model';
import { RigaOrdineServices } from '../../../services/riga-ordine-services';
import { RigaOrdineDialog } from '../dialogs/riga-ordine-dialog/riga-ordine-dialog';
import { AccountServices } from '../../../services/account-services';

@Component({
  selector: 'app-gestione-ordini',
  standalone: false,
  templateUrl: './gestione-ordini.html',
  styleUrl: './gestione-ordini.css',
})
export class GestioneOrdini implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['account', 'data', 'stato', 'tipoPagamento', 'tipoSpedizione', 'righeOrdine'];
  dataSource = new MatTableDataSource<Ordine>();
  righeOrdine: { [idOrdine: number]: RigaOrdine[] } = {};
  loadingRighe: { [idOrdine: number]: boolean } = {};

  filters = {
    username: '',
    tipoPagamento: '',
    tipoSpedizione: '',
    anno: null as number | null,
    mese: null as number | null,
    giorno: null as number | null,
    statoOrdine: '',
    isbnInput: ''
  };

  loading = false;
  expandedOrdine: Ordine | null = null;

  constructor(
    private ordineServices: OrdiniServices,
    private rigaOrdineServices: RigaOrdineServices,
    private accountServices: AccountServices,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData() {
    this.loading = true;
    const params: any = {};
    if (this.filters.username) params.username = this.filters.username;
    if (this.filters.tipoPagamento) params.tipoPagamento = this.filters.tipoPagamento;
    if (this.filters.tipoSpedizione) params.tipoSpedizione = this.filters.tipoSpedizione;
    if (this.filters.statoOrdine) params.statoOrdine = this.filters.statoOrdine;
    if (this.filters.isbnInput) params.isbns = [this.filters.isbnInput];
    if (this.filters.anno) params.anno = this.filters.anno;
    if (this.filters.mese) params.mese = this.filters.mese;
    if (this.filters.giorno) params.giorno = this.filters.giorno;

    this.ordineServices.list(params).subscribe({
      next: (data) => { this.dataSource.data = data; this.loading = false; },
      error: () => { this.showMsg('Errore caricamento dati', true); this.loading = false; }
    });
  }

  toggleExpand(ordine: Ordine, event: Event) {
    event.stopPropagation();
    if (this.expandedOrdine === ordine) {
      this.expandedOrdine = null;
    } else {
      this.expandedOrdine = ordine;
      this.loadRighe(ordine);
    }
  }

  loadRighe(ordine: Ordine) {
    this.loadingRighe = { ...this.loadingRighe, [ordine.id]: true };
    this.righeOrdine = { ...this.righeOrdine, [ordine.id]: [] };

    this.rigaOrdineServices.list(ordine.id).subscribe({
      next: (righe) => {
        this.righeOrdine = { ...this.righeOrdine, [ordine.id]: [...righe] };
        this.loadingRighe = { ...this.loadingRighe, [ordine.id]: false };
        this.cdr.detectChanges();
      },
      error: () => {
        this.showMsg('Errore caricamento righe', true);
        this.loadingRighe = { ...this.loadingRighe, [ordine.id]: false };
        this.cdr.detectChanges();
      }
    });
  }

  // Riga Ordine 
  openRigaDialog(riga: RigaOrdine | null, ordine: Ordine) {
    const dialogRef = this.dialog.open(RigaOrdineDialog, {
      width: '400px',
      data: { riga, idOrdine: ordine.id }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result || result.action !== 'save') return;

      const call = riga
        ? this.rigaOrdineServices.update({ id: riga.id, ...result })
        : this.rigaOrdineServices.create(result);

      call.subscribe({
        next: (res: any) => {
          this.showMsg(res.msg, false);
    
        if (riga) {
          const righeAggiornate = this.righeOrdine[ordine.id].map(r => 
            r.id === riga.id ? { ...r, numeroCopie: result.numeroCopie } : r
          );
          this.righeOrdine = { 
            ...this.righeOrdine, 
            [ordine.id]: righeAggiornate 
          };
        } else {
          this.righeOrdine = { 
            ...this.righeOrdine, 
            [ordine.id]: [...this.righeOrdine[ordine.id], res] 
          };
        }
      this.cdr.detectChanges()
        },
        error: (err) => this.showMsg(err.error?.msg, true)
      });
    });
  }

    openDeleteRigaDialog(riga: RigaOrdine, ordine: Ordine) {
      const righe = this.righeOrdine[ordine.id] ?? [];
      if (righe.length <= 1) {
        this.showMsg("Impossibile eliminare: l'ordine deve avere almeno un ordine.", true);
        return;
      }
      if (!confirm('Confermi eliminazione?')) return;

      this.rigaOrdineServices.delete(riga.id).subscribe({
        next: (res: any) => {
          this.showMsg(res.msg, false);
          this.loadRighe(ordine);
        },
        error: (err) => this.showMsg(err.error?.msg, true)
      });
    }
    

  // Ordine 
  openCreateDialog() {
    const dialogRef = this.dialog.open(OrdiniDialog, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

    //Controlla se esiste già un ordine per questo username
    const ordineEsistente = this.dataSource.data.some(
      o => (o.account as any)?.username?.toLowerCase() === result.username?.toLowerCase()
    );

    if (ordineEsistente) {
      this.showMsg('Esiste già un ordine per questo utente.', true);
      return;
    }
      this.accountServices.findByUsername(result.username).subscribe({
        next: (account: any) => {
          const ordineData = {
            account: account.id,
            pagamento: result.tipoPagamento,
            spedizione: result.tipoSpedizione,
            stato: result.stato,
            data: result.data,
            righeOrdineRequest: result.righe?.map((r: any) => ({
              manga: typeof r.manga === 'string' ? r.manga : r.manga?.isbn,
              numeroCopie: r.numeroCopie ?? 1
            })) ?? []
          };

          this.ordineServices.create(ordineData as any).subscribe({
            next: (res: any) => { this.showMsg(res.msg, false); 
              this.dataSource.data = [res, ...this.dataSource.data];
              this.righeOrdine[res.id] = res.righeOrdine ?? [];
              this.expandedOrdine = res;
              this.loadData();
              this.cdr.detectChanges();
               },
            error: (err) => this.showMsg(err.error?.msg, true)
          });
        },
        error: () => this.showMsg('Username non trovato', true)
      });
    });
  }

  edit(ordine: Ordine) {
    const dialogRef = this.dialog.open(OrdiniDialog, {
      width: '500px',
      data: ordine
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'delete') {
        this.ordineServices.delete(result.id).subscribe({
          next: (res: any) => { this.showMsg(res.msg, false); this.loadData(); },
          error: (err) => this.showMsg(err.error?.msg, true)
        });
      }

      if (result.action === 'save') {
        this.accountServices.findByUsername(result.username).subscribe({
          next: (account: any) => {

            const ordineData = {
              id: ordine.id,
              account: account.id,
              pagamento: result.tipoPagamento,
              spedizione: result.tipoSpedizione,
              stato: result.stato,
              data: result.data
            };

            this.ordineServices.update(ordineData as any).subscribe({
              
              next: (res: any) => { 
                this.showMsg(res.msg, false); 
                this.loadData(); 
              },
              error: (err) => this.showMsg(err.error?.msg, true)
            });

          },
          error: () => this.showMsg('Username non trovato', true)
        });
      }
    });
  }

  //Filters
  onFilterChange() {
    this.loadData();
  }

  resetFilters() {
    this.filters = {
      username: '',
      tipoPagamento: '',
      tipoSpedizione: '',
      anno: null,   
      mese: null,
      giorno: null,
      statoOrdine: '',
      isbnInput: ''
    };
    this.loadData();
  }


  getMangaIsbn(riga: RigaOrdine): string {
    if (!riga.manga) return '-';
    if (typeof riga.manga === 'string') return riga.manga;
    return (riga.manga as any).isbn ?? '-';
  }


  showMsg(msg: string, isError: boolean) {
    this.snack.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}